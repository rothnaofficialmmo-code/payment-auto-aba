const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc } = require('firebase/firestore');

const app = express();
app.use(express.json());

// --- យកមកពី Firebase Console របស់អ្នក ---
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.post('/api/aba-webhook', async (req, res) => {
    try {
        const body = req.body;
        const messageText = body.message ? body.message.text : "";
        console.log("សារទទួលបាន:", messageText);

        // ឆែករកលេខ 9.99 ក្នុងសារ
        if (messageText.includes("9.99")) {
            const userQuery = query(
                collection(db, "users"), 
                where("status", "==", "pending"),
                where("pendingAmount", "==", "$9.99")
            );

            const querySnapshot = await getDocs(userQuery);
            
            if (querySnapshot.empty) {
                return res.status(200).send("No matching user");
            }

            for (const docSnap of querySnapshot.docs) {
                await updateDoc(docSnap.ref, { 
                    status: "paid",
                    updatedAt: new Date()
                });
            }
            return res.status(200).send("Success Updated");
        }
        res.status(200).send("Not 9.99");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = app;
