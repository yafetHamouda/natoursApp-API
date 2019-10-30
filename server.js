const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION ! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION ! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successfull'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
