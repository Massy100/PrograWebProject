import TableUserAdministration from "@/components/TableUserAdministration";
import "./user-administration.css"


export default function UserAdmin() {
  return(
    <>
        <div className="div-userAdmin">
            <h3 className="title-user-admin">Users with Access</h3>
            <div>
            <TableUserAdministration />
            </div>
        </div>
    </>
  );
}
