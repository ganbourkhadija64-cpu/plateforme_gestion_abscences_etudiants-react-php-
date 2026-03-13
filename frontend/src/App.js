import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Students from "./pages/Students";
import AdminStudents from "./pages/AdminStudents";
import AdminAbsences from "./pages/AdminAbsences";
import AdminClasses from "./pages/AdminClasses";
import AdminSubjects from "./pages/AdminSubjects";
import AdminJustifications from "./pages/AdminJustifications";
import AdminExport from "./pages/AdminExport";
import TeacherDashboard from "./pages/TeacherDashboard";
import AbsenceForm from "./pages/AbsenceForm";
import AbsenceList from "./pages/AbsenceList";
import Users from "./pages/Utilisateurs";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/absences" element={<AdminAbsences />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/justifications" element={<AdminJustifications />} />
        <Route path="/admin/export" element={<AdminExport />} />
        <Route path="/admin/users" element={<Users />} />

        <Route path="/enseignant" element={<TeacherDashboard />} />
        <Route path="/enseignant/saisie" element={<AbsenceForm />} />
        <Route path="/enseignant/mes-absences" element={<AbsenceList />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;