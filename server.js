const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(process.env.MONGODB_URI || DB)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 8000;

if (process.env.NODE_ENV === "production ") {

}
app.listen(port);
