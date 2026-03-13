import Sidebar from "../components/Sidebar";
import Students from "./Students";

function AdminStudents() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Students />
    </div>
  );
}

export default AdminStudents;