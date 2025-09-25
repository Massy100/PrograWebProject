import SearchResults from "@/components/searchResults";
import TableUserAdministration from "@/components/TableUserAdministration";
import "./user-administration.css"
import SidebarOptions from "@/components/navAdmin";


export default function UserAdmin() {
  return(
    <>
        <SidebarOptions/>
        <SearchResults
            headerProps={{ isLoggedIn: true, marketOpen: true, totalAmount: 100 }}
            title="Resultados de la búsqueda"
        />
        <div className="div-userAdmin">
            <h3 className="title-user-admin">Users with Accese</h3>
            <div>
            <TableUserAdministration />
            </div>
        </div>
    </>
  );
}
