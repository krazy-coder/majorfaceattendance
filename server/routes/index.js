var express = require('express');
var router = express.Router();
var mysql = require('mysql');

const attendanceConn = mysql.createPool({
  debug: false,
  connectionLimit: 1,
  host: 'localhost',
  user: 'MyAppFace',
  password: 'tiger',
  database: 'studentAttendance',
  timezone: '0000',
  port: 3306
});

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const loc = 'centralindia.api.cognitive.microsoft.com';
const key = '23fdf44e6c2940efbea2f9df0bb39d11';
var bleno = require('bleno');

const facelist_id = 'sample1'; // replace with your unique facelist ID

const biop = {
  baseURL: `https://${loc}/face/v1.0`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': key
  }
};


router.get("/create-facelist", async (req, res) => {
  try {
    var instance = { ... biop };
    const response = await axios.put(
      `/facelists/${facelist_id}`,
      {
        name: "sample1 facelist"
      },
      instance
    );

    console.log("created facelist: ", response.data);
    res.send('ok');

  } catch (err) {
    console.log(JSON.stringify(instance,null,3))
    console.log("error creating facelist: ", err);
    res.send('not ok');
  }
});


router.get("/add-face", async (req, res) => {
  try {
    const instance_options = { ...biop };
    instance_options.headers['Content-Type'] = 'application/octet-stream';
    const instance = axios.create(instance_options);
    var imgname;
    const file_contents = fs.readFileSync(`server/images/${imgname}`);

    const response = await axios.post(
      `/facelists/${facelist_id}/persistedFaces`,
      file_contents,
      instance_options
    );

    console.log('added face: ', response.data);
    res.send('ok');

  } catch (err) {
    console.log("err: ", err);
    res.send('not ok' + ' \n'+ JSON.stringify(err,null,3));
  }
});

async function insertStudentAttendance(details) {
  var date = new Date();  
  return new Promise( (resolve, reject) => {
    const query = `INSERT INTO 
                            attendance
                        VALUES
                            (?,?,?);`
    attendanceConn.query(query, [details.teacherID, details.studentID, date], (er, rows) => {
      if (err) return reject(err);
      resolve();
    })
  })
}
router.post("/update-attendance", async (req,res) => {
    insertStudentAttendance(req.data)
      .then(() => {
        console.log("Student attendance marked for ", req.data.studentID);
        res.send('ok');
      })
      .catch((err) => {
        console.log(error);
        res.send('not ok')
      })
});


module.exports = router;
