import React from "react";
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import { useAppContext } from "./context/AppContext";
import AlumniLogin from "./pages/AlumniLogin";
import StudentLogin from "./pages/StudentLogin";
import CollegeLogin from "./pages/CollegeLogin";
import { useParams } from 'react-router-dom';
import Chat from './pages/Chat';
import Call from './pages/Call';
import Mentor from "./pages/Mentor";
import Footer from "./components/Footer";
import ChaPage from "./pages/ChaPage";
import AlumniRegister from "./pages/AlumniRegister";
import Register from "./pages/Register";
import StudentRegister from "./pages/StudentRegister";
import CollegeRegister from "./pages/CollegeRegister";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminColleges from "./pages/AdminColleges";
import AdminStudents from "./pages/AdminStudents";
import AdminAlumni from "./pages/AdminAlumni";
import AdminTestimonials from "./pages/AdminTestimonials";
import CollegeDashboard from "./pages/CollegeDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import ProfileDashBoard from "./pages/ProfileDashBoard";
import AlumniDetail from "./pages/AlumniDetail";
import Community from "./pages/Community";
import StudentDetail from './pages/StudentDetail';



const CallWrapper = ({ currentUser }) => {
  const { id } = useParams();
  if (!currentUser) {
    return <div>Loading...</div>; // or redirect to login
  }
  return <Call user={currentUser} receiverId={id} />;
};


const ChatWrapper = ({ currentUser }) => {
  // const { id } = useParams();
  if (!currentUser) {
    return <div>Loading...</div>; // or redirect to login
  }
  return <ChaPage loggedInUserId={currentUser._id} />;
};

// ScrollTo component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  const { currentUser } = useAppContext();
  //  console.log("app.jsx",currentUser)

  return (
    <>
      <Nav />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/alumnies" element={<Mentor/>} />
        <Route path="/alumni/:id" element={<AlumniDetail/>} />
        <Route path="/student/:id" element={<StudentDetail/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/alumni" element={<AlumniLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/college" element={<CollegeLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/colleges" element={<AdminColleges />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/alumni" element={<AdminAlumni />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/register/alumni" element={<AlumniRegister/>} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/college" element={<CollegeRegister />} />
        <Route path="/college/dashboard" element={<CollegeDashboard />} />
        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
        <Route path="/community" element={<Community/>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/chat" element={<ChaPage/>} />
        <Route path="/chat/:id" element={<ChatWrapper currentUser={currentUser} />} />
        <Route path="/call/:id" element={<CallWrapper currentUser={currentUser} />} />
       <Route path="/profile" element={<ProfileDashBoard/>}/>
      </Routes>
      <Footer/>
    </>
  );
};

export default App;
