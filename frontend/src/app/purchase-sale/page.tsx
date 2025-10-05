import BuyProcess from "@/components/Sale";
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