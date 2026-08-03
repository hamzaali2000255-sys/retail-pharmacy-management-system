require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const pool = mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'pharmacy_pos',waitForConnections:true,connectionLimit:10});

app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

function invoiceNo(){return `INV-${Date.now()}-${Math.floor(Math.random()*900+100)}`;}
function tabletsFor(item, medicine){
  if(item.unit_type==='tablet') return item.quantity;
  if(item.unit_type==='strip') return item.quantity * medicine.tablets_per_strip;
  if(item.unit_type==='box') return item.quantity * medicine.tablets_per_strip * medicine.strips_per_box;
  throw new Error('Invalid unit type');
}
function priceFor(item, medicine){
  if(item.unit_type==='tablet') return Number(medicine.tablet_price);
  if(item.unit_type==='strip') return Number(medicine.strip_price);
  return Number(medicine.box_price);
}

app.get('/api/health', async (_req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true});}catch(e){res.status(500).json({ok:false,error:e.message});}});
app.get('/api/dashboard', async (_req,res)=>{
  try{
    const [[stock]] = await pool.query('SELECT COUNT(*) medicines, COALESCE(SUM(stock_tablets),0) tablets, SUM(stock_tablets <= reorder_level) low_stock FROM medicines');
    const [[sales]] = await pool.query("SELECT COUNT(*) sales_today, COALESCE(SUM(total),0) revenue_today FROM sales WHERE DATE(created_at)=CURDATE()");
    const [expiring] = await pool.query("SELECT id,name,batch_no,expiry_date,stock_tablets FROM medicines WHERE expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(),INTERVAL 90 DAY) ORDER BY expiry_date LIMIT 10");
    res.json({...stock,...sales,expiring});
  }catch(e){res.status(500).json({error:e.message});}
});
app.get('/api/medicines', async (req,res)=>{
  try{const q=String(req.query.q||'').trim();const [rows]=await pool.query('SELECT * FROM medicines WHERE name LIKE ? OR generic_name LIKE ? OR barcode LIKE ? ORDER BY name LIMIT 100',[`%${q}%`,`%${q}%`,`%${q}%`]);res.json(rows);}catch(e){res.status(500).json({error:e.message});}
});
app.post('/api/medicines', async (req,res)=>{
  try{const m=req.body;const [r]=await pool.query(`INSERT INTO medicines(name,generic_name,barcode,category,manufacturer,batch_no,expiry_date,purchase_price,box_price,strip_price,tablet_price,tablets_per_strip,strips_per_box,stock_tablets,reorder_level) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[m.name,m.generic_name||null,m.barcode||null,m.category||null,m.manufacturer||null,m.batch_no||null,m.expiry_date||null,m.purchase_price||0,m.box_price||0,m.strip_price||0,m.tablet_price||0,m.tablets_per_strip||10,m.strips_per_box||10,m.stock_tablets||0,m.reorder_level||10]);res.status(201).json({id:r.insertId});}catch(e){res.status(400).json({error:e.message});}
});
app.get('/api/sales', async (_req,res)=>{try{const [rows]=await pool.query('SELECT s.*,c.name customer_name FROM sales s LEFT JOIN customers c ON c.id=s.customer_id ORDER BY s.id DESC LIMIT 100');res.json(rows);}catch(e){res.status(500).json({error:e.message});}});
app.post('/api/sales', async (req,res)=>{
  const conn=await pool.getConnection();
  try{
    const {customer_id=null,discount=0,payment_method='cash',items=[]}=req.body;if(!items.length)throw new Error('Cart is empty');
    await conn.beginTransaction();
    let subtotal=0;const prepared=[];
    for(const item of items){
      const [rows]=await conn.query('SELECT * FROM medicines WHERE id=? FOR UPDATE',[item.medicine_id]);if(!rows.length)throw new Error(`Medicine ${item.medicine_id} not found`);
      const m=rows[0], qty=Number(item.quantity);if(!Number.isInteger(qty)||qty<1)throw new Error('Quantity must be a positive integer');
      const deducted=tabletsFor({...item,quantity:qty},m);if(m.stock_tablets<deducted)throw new Error(`${m.name}: insufficient stock`);
      const unitPrice=priceFor(item,m), total=unitPrice*qty;subtotal+=total;prepared.push({m,unit_type:item.unit_type,quantity:qty,unitPrice,total,deducted});
    }
    const finalTotal=Math.max(0,subtotal-Number(discount||0));const inv=invoiceNo();
    const [sale]=await conn.query('INSERT INTO sales(invoice_no,customer_id,subtotal,discount,total,payment_method) VALUES(?,?,?,?,?,?)',[inv,customer_id,subtotal,discount,finalTotal,payment_method]);
    for(const p of prepared){await conn.query('INSERT INTO sale_items(sale_id,medicine_id,unit_type,quantity,unit_price,total,tablets_deducted) VALUES(?,?,?,?,?,?,?)',[sale.insertId,p.m.id,p.unit_type,p.quantity,p.unitPrice,p.total,p.deducted]);await conn.query('UPDATE medicines SET stock_tablets=stock_tablets-? WHERE id=?',[p.deducted,p.m.id]);await conn.query('INSERT INTO stock_movements(medicine_id,movement_type,quantity_tablets,reference) VALUES(?,?,?,?)',[p.m.id,'sale',-p.deducted,inv]);}
    await conn.commit();res.status(201).json({id:sale.insertId,invoice_no:inv,total:finalTotal});
  }catch(e){await conn.rollback();res.status(400).json({error:e.message});}finally{conn.release();}
});

app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Pharmacy POS running at http://localhost:${PORT}`));
