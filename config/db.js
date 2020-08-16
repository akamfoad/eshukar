const mongoose = require("mongoose");

exports.connect = async function () {
  const conn = await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: "eshukar",
  });

  console.log(
    `MongoDB connected: ${conn.connection.host + ":" + conn.connection.port}`
  );
};
