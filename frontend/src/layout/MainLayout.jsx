import { useState } from "react"; 
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar";  

const MainLayout = ({ children }) => {   
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);    
  
  return (     
    <div className="flex h-screen overflow-hidden">       
      <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />       
      <div className="flex-1 flex flex-col overflow-hidden">         
        <Navbar />         
        {/* CHANGEMENT ICI : p-6 → p-4 (ou même p-3) */}
        <main className="flex-1 overflow-y-auto p-4">           
          {children}
        </main>       
      </div>     
    </div>   
  ); 
};  

export default MainLayout;