// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB1Tt6oaMJh4QF4jxmhBzSuBME_9rEgmF8",
    authDomain: "mystore-d2d97.firebaseapp.com",
    projectId: "mystore-d2d97",
    storageBucket: "mystore-d2d97.firebasestorage.app",
    messagingSenderId: "437150324137",
    appId: "1:437150324137:web:5d729b3e178f05d42060b8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ตั้งค่าให้ใช้ Timestamp
db.settings({ timestampsInSnapshots: true });

// ฟังก์ชันอัปโหลดรูปภาพหลายรูป
async function uploadMultipleImages(files, folder = 'products') {
    const uploadPromises = [];
    const imageUrls = [];
    
    for (let file of files) {
        const timestamp = Date.now();
        const fileName = `${folder}/${timestamp}_${file.name}`;
        const storageRef = storage.ref(fileName);
        
        const uploadTask = storageRef.put(file);
        const promise = new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,
                (error) => reject(error),
                async () => {
                    const url = await storageRef.getDownloadURL();
                    imageUrls.push(url);
                    resolve(url);
                }
            );
        });
        uploadPromises.push(promise);
    }
    
    await Promise.all(uploadPromises);
    return imageUrls;
}

// ฟังก์ชันลบรูปภาพ
async function deleteImage(imageUrl) {
    try {
        const ref = storage.refFromURL(imageUrl);
        await ref.delete();
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}