
import "./transactionsAdmin.css"
import FilterTransactionType from "@/components/FilterTransactionType";

export default function TransactionsAdmin() {

  return ( 
    <div className="div-trasactionAdmin">
        <h3 className="title-trasaction-admin">Transactions</h3>
        <div className="div-date-filter">
            <FilterTransactionType/>
        </div>
        
        
    </div>
  )
}