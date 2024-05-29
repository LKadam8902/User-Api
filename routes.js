const express = require('express');
const Model = require('./model/user');
const Complaint=require('./model/complaints')
const mongoose=require('mongoose');
const router = express.Router();

const logRequestDetails = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Pass the request to the next middleware or route handler
};

// Apply the middleware to all routes
router.use(logRequestDetails);


router.get("/dummy",(req,res)=>{
    res.send("je;pknjkasd")
})
//Post Method
router.post('/addUser',async(req, res) => {
    const data = new Model({
        userId:req.body.userId,
        userName:req.body.userName,
        userEmail:req.body.userEmail,
        userPhone:req.body.userPhone,
        userMethod:req.body.userMethod,
        complaints:req.body.complaints
    })

    try{
        const dataToSave = data.save();
        await dataToSave;
        res.status(200).json(dataToSave)
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
});

// POST route to add a complaint
router.post('/addComplaint/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { title,type, description,imgs, date } = req.body;

        // Validate the input
        if (!title ||!type|| !description ||!imgs|| !date) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new complaint object
        const newComplaint = new Complaint({
            title,
            type,
            description,
            imgs,
            date
        });
         
        await newComplaint.save();

        // Find the user by userId and add the complaint to the complaints array
        const updatedUser = await Model.findOneAndUpdate(
            { userId :id},
            { $push: { complaints: newComplaint._id } },
            { new: true }
        );

        // Handle the case when no user is found
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the response with the updated user data
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Get all Method
router.get('/allCSR', async(req, res) => {
    try{
        const data = await Model.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get all complaints Method
router.get('/getAllComplaints', async (req, res) => {
    try {
          // Fetch all users and populate their complaints
          const users = await Model.find({}, 'userId userName complaints').populate('complaints');

          // Format the response to include only necessary fields
          const userComplaints = users.map(user => ({
              userId: user.userId,
              userName: user.userName,
              complaints: user.complaints
          }));
  
          // Send the response with the user complaints
          res.json(userComplaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET complaint by ID
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaintId = req.params.id;
    console.log('Fetching complaint with ID:', complaintId);

    // Validate the input
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    // Find the specific complaint by its ID
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Send the response with the specific complaint
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


//Update by ID Method
router.patch('/update/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Model.findOneAndUpdate(
            {userId:id}, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }

});

router.patch('/updateComplaint/:id', async (req, res) => {
    try {
        const complaintId = req.params.id;
        const updates = req.body;

        // Validate the input
        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ message: 'Invalid complaint ID' });
        }

        // Find the complaint by its ID
        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Update the complaint fields
        Object.assign(complaint, updates);

        // Save the updated complaint document
        await complaint.save();

        // Send the response with the updated complaint data
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;

//Delete by ID Method
router.delete('/delete/:id',async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Model.findOneAndDelete({userId:id})
        res.send(`Document with ${data} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


// Endpoint to delete a specific complaint
router.delete('/deleteComplaint/:uId/:id', async (req, res) => {
    try {
        const complaintId = req.params.id;
        const uId=req.params.uId;

        // Validate the input
        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({ message: 'Invalid complaint ID' });
        }


        const user = await Model.findOne({userId:uId});

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the complaint ID from the user's complaints array
        user.complaints.pull(complaintId);

        // Save the updated user document
        await user.save();


        // Find the complaint by its ID and remove it
        const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

        if (!deletedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Send a success response
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router