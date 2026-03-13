import Sidebar from "../components/Sidebar";
import Export from "./Export";

function AdminExport() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <Export />
    </div>
  );
}

export default AdminExport;
