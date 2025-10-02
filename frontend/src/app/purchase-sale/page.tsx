import BuyProcess from "@/components/PurchaseSale";
import "./Purchase_Sale.css"


export default function PurchaseSales() {
  return(
    <>
        <div className="div-purchase">
            <h3 className="title">Purchase and Sale</h3>
            <div>
            <BuyProcess />
            </div>
        </div>
    </>
  );
}