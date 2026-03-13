import Sidebar from "../components/Sidebar";
import Absences from "./Absences";

function AdminAbsences() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Absences />
    </div>
  );
}

export default AdminAbsences;
