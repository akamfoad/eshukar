const fs = require("fs");
const { connect } = require("./config/db");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/.env" });

// Load models
const Service = require("./models/Services");
const Category = require("./models/Category");
const Worker = require("./models/Worker");
const Team = require("./models/Teams");
const Customer = require("./models/Customer");
const Request = require("./models/Requests");
const Rating = require("./models/Ratings");
const Admin = require("./models/Adminstrators");

// Connect to DB
connect();

// load data
const services = JSON.parse(fs.readFileSync("_data/services.json"));
const categories = JSON.parse(fs.readFileSync("_data/categories.json"));
const workers = JSON.parse(fs.readFileSync("_data/workers.json"));
const teams = JSON.parse(fs.readFileSync("_data/teams.json"));
const customers = JSON.parse(fs.readFileSync("_data/customers.json"));
const requests = JSON.parse(fs.readFileSync("_data/requests.json"));
const admins = JSON.parse(fs.readFileSync("_data/admins.json"));

const importData = async function () {
  try {
    console.log("importing categories...");
    const savedCT = await Category.create(categories);
    services.forEach((val, i) => {
      val.categoryId = savedCT[i]._id;
    });

    console.log("importing services...");
    services.forEach((serv) => {
      const ava = [
        {
          from: Date.now(),
          to: new Date(Date.now() + 1000 * 60 * 60 * 8),
        },
      ];
      serv.availability = ava;
      return serv;
    });
    const savedServcies = await Service.create(services);

    console.log("importing workers...");
    const savedWorkers = await Worker.create(workers);

    console.log("importing teams...");
    teams.forEach((team, i) => {
      team.serviceId = savedServcies[i]._id;
      team.leaderId = savedWorkers[i]._id;
    });

    const savedTeams = await Team.create(teams);
    for (let i = 0; i < savedTeams.length; i++) {
      const updatedWorker = await Worker.findByIdAndUpdate(
        savedWorkers[i]._id,
        {
          teamId: savedTeams[i]._id,
        },
        {
          new: true,
        }
      );
    }

    console.log("importing customers...");
    const savedCustomers = await Customer.create(customers);

    console.log("importing requests...");
    requests.forEach((req, i) => {
      req.customerId = savedCustomers[i]._id;
      req.serviceId = savedServcies[i]._id;
      if (Math.random() > 0.5) {
        req.teamId = savedTeams[i]._id;
        req.status = "TEAM_ASSIGNED";
      }
      if (!req.address) {
        req.address = savedCustomers[i].address;
      }
      if (!req.phoneNoOfPlace) {
        req.phoneNoOfPlace = savedCustomers[i].phoneNo;
      }
    });
    await Request.create(requests);

    console.log("importing admins...");
    await Admin.create(admins);

    console.log("data importing finished");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
  }
};

const deleteData = async function () {
  try {
    await Service.deleteMany();
    console.log("services Purged");

    await Category.deleteMany();
    console.log("categories Purged");

    await Worker.deleteMany();
    console.log("workers Purged");

    await Team.deleteMany();
    console.log("teams Purged");

    await Customer.deleteMany();
    console.log("customers Purged");

    await Request.deleteMany();
    console.log("requests Purged");

    await Rating.deleteMany();
    console.log("ratings Purged");

    await Admin.deleteMany();
    console.log("admins Purged");

    console.log("Data Purged finished");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
  }
};

if (process.argv[2] === "-i") {
  console.log("importing data starting");
  importData();
} else if (process.argv[2] === "-d") {
  console.log("deleting data starting");
  deleteData();
} else {
  console.log(
    "node seeder [-i, -d]\n\t-i\tload data to DB\n\t-d\tdelete data from DB\n"
  );
}
