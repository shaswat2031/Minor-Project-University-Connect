
---

# **University Connect**  

University Connect is a full-stack web platform that helps students connect with each other, showcase their skills, and collaborate on academic or professional projects. The platform includes a **Talent Marketplace**, **Student Connect**, **Messaging System**, and **Certification Feature**.

---

## **Project Structure**  

This project has two main directories:  

📂 **`frontend/`** (React Vite + Tailwind CSS) - Manages the user interface and client-side functionality.  
📂 **`university-connect-backend/`** (Node.js + Express + MongoDB) - Handles API requests, database management, and authentication.  

---

## **Features**  

### **Frontend Features (React + Vite)**  
✅ **Home Page** - Showcases the platform's main features .  
✅ **Authentication** - Register/Login using username and password.  
✅ **Student Connect** - Fill out academic details, view student profiles, and message students.  
✅ **Talent Marketplace** - Users can list their services, such as web development, tutoring, etc.  
✅ **Messaging** - Students can chat with each other via a real-time messaging system.  
✅ **Certifications** - Users can take quizzes, and if they pass, they receive a downloadable certificate.  

### **Backend Features (Node.js + Express + MongoDB)**  
✅ **User Management** - Stores user data, authentication, and authorization.  
✅ **MongoDB Database** - Stores user profiles, messages, and certification details.  
✅ **API Endpoints** - Serves data for student profiles, messages, and certifications.  
✅ **JWT Authentication** - Secure user sessions.  
✅ **File Storage** - Stores certificate PDFs for users who pass quizzes.  

---

## **Installation & Setup**  

### **Prerequisites**  
Ensure you have the following installed:  

- **Node.js** (>= 16.x) → [Download here](https://nodejs.org/)  
- **MongoDB** (Locally or via MongoDB Atlas)  
- **NPM or Yarn** (NPM comes with Node.js)  
- **Git** (To clone the repository)  

---

### **Step 1: Clone the Repository**  
```bash
git clone https://github.com/shaswat2031/university-connect.git
cd university-connect
```

---

## **Frontend Setup (React + Vite + Tailwind CSS)**  

1. **Navigate to the frontend directory:**  
   ```bash
   cd frontend
   ```  

2. **Install dependencies:**  
   ```bash
   npm install
   ```  

3. **Run the frontend:**  
   ```bash
   npm run dev
   ```  
   The application will start at **`http://localhost:5173/`** (default Vite port).  

---

## **Backend Setup (Node.js + Express + MongoDB)**  

1. **Navigate to the backend directory:**  
   ```bash
   cd university-connect-backend
   ```  

2. **Install dependencies:**  
   ```bash
   npm install
   ```  

3. **Set up environment variables:**  
   - Create a `.env` file in `university-connect-backend/`.  
   - Add the following variables:  

   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://your-mongo-connection-string
   JWT_SECRET=your-secret-key
   ```

4. **Run the backend server:**  
   ```bash
   nodemon server.js
   ```  
   The backend will run at **`http://localhost:5000/`** (default port).  

---

## **Project Tech Stack**  

### **Frontend:**  
- **React (Vite)** - Fast client-side rendering  
- **Tailwind CSS** - Modern styling  
- **Axios** - Fetching API data  
- **React Router** - Navigation  
- **Redux (Optional)** - State management  

### **Backend:**  
- **Node.js + Express.js** - Backend framework  
- **MongoDB + Mongoose** - NoSQL Database  
- **JWT Authentication** - Secure user login  
- **Nodemon** - Auto-restart for development  

### **Additional Libraries Used:**  
- **bcrypt** - Password hashing  
- **cors** - Cross-origin resource sharing  
- **dotenv** - Load environment variables  
- **jsonwebtoken** - Token-based authentication  
- **pdfkit** - Certificate generation  



---


This README now includes everything from setup to deployment! 🚀 Let me know if you need more improvements. 🎯
