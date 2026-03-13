import Sidebar from "../components/Sidebar";
import Subjects from "./Subjects";

function AdminSubjects() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Subjects />
    </div>
  );
}

export default AdminSubjects;
