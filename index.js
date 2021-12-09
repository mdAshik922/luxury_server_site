const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient } = require('mongodb');
// const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;

//initilazition firebase token
// let serviceAccount = JSON.parse(process.env.FIREBASE_Luxury_TOKEN);
 

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.89jki.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      };

  }
  next();
};

async function run() {
    try {
      await client.connect();
      const database = client.db('luxury_room');
      const userCollection = database.collection('users');
      const roomsCollection = database.collection('rooms');
      const serviceCollection = database.collection('service');
      const orderCollection = database.collection('order');
      const reviewCollection = database.collection('review');

    
app.get('/rooms', async (req, res) => {
 const rooms = roomsCollection.find({});
 const result = await rooms.toArray();
  res.json(result);
});


app.get('/service', async (req, res) => {
 const service = serviceCollection.find({});
 const result = await service.toArray();
  res.json(result);
});

app.get('/service/:id', async (req, res) => {
  const id = req.params.id;
  const query =  { _id: ObjectId(id) };
  const service = await serviceCollection.findOne(query);
   res.json(service);
 });

app.get('/order', async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
 const order = orderCollection.find(query);
 const result = await order.toArray();
  res.json(result);
});

app.post('/order', async (req,res) => {
const order = req.body;
const allOrder = await orderCollection.insertOne(order);
    res.json(allOrder);
});

//# load all orders: get api
app.get("/orders", async (req, res) => {
  const email = req.query.email;
  let result;
  if (email) {
    result = await orderCollection.find({ email }).toArray();
  } else {
    result = await orderCollection.find({}).toArray();
  }
  res.json(result);
});

 //#single data load: get api
 app.get("/placeOrder/:id", async (req, res) => {
  const result = await serviceCollection.findOne({
    _id: ObjectId(req.params.id),
  });
  res.json(result);
});

 //# Change status: put api
 app.put("/updateOrderStatus", async (req, res) => {
  const id = req.body.id;
  const status = req.body.status;
  const result = await orderCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: { status: status },
    }
  );
  res.json(result.modifiedCount);
});

//# update a product: put api
app.put("/updateProduct", async (req, res) => {
  const id = req.query.id;
  const product = req.body;
  const result = await orderCollection.updateOne(
    { _id: ObjectId(id) },
    {
      $set: product,
    }
  );
  res.json(result);
});

//#all products load: get api
app.get("/products", async (req, res) => {
  const result = await serviceCollection.find({}).toArray();
  res.json(result);
});

 //# add a new product: post api
 app.post("/addProduct", async (req, res) => {
  const result = await orderCollection.insertOne(req.body);
  res.json(result);
});

//# delete a product: delete api
app.delete("/deleteProduct/:id", async (req, res) => {
  const result = await product_collection.deleteOne({
    _id: ObjectId(req.params.id),
  });
  res.json(result);
});

 //# delete specific order: delete api
 app.delete("/deleteOrder/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const result = await orderCollection.deleteOne(query);
  res.send(result);
});

app.post('/review', async(req, res) => {
const message = req.body;
const allMessage = await reviewCollection.insertOne(message);
    res.json(allMessage);
});

app.get('/review', async(req, res) => {
   const review = reviewCollection.find({});
   const result = await review.toArray();
    res.json(result);
});




app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  let isAdmin = false;
  if (user?.role === 'admin') {
      isAdmin = true;
  };
  res.json({ admin: isAdmin });
});

app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.json(result);
});

app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});


app.put('/users/admin', verifyToken, async (req, res) => {
  const user = req.body;
  const requester = req.decodedEmail;
  if (requester) {
      const requesterAccount = await usersCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
          const filter = { email: user.email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
      };
  }
  else {
      res.status(403).json({ message: 'you do not have access to make admin' });
  };

});



// app.post('create/payment-intent', async (req, res) => {
//   const paymentInfo = req.body;
//   const amount = paymentInfo.price*100;
//   const paymentIntent = await stripe.paymentIntents.create({
//       currency: 'usd',
//       amount: amount,
//       payment_method_types: [
//           card
//       ]
//   });
//   res.send({
//       clientSecret: paymentIntent.client_secret,
//     });
// });

    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) =>{
    console.log('thank you')
    res.send('my server')
});

app.listen(port, ()=>{
    console.log('start my last server', port)
})