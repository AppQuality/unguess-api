import Table from "./table";

interface CoinParams {
  id?: number;
  customer_id: number;
  amount: number;
  agreement_id?: number;
  price?: number;
  created_on?: string;
  updated_on?: string;
  notes?: string;
}

const defaultItem: CoinParams = {
  customer_id: 0,
  amount: 0,
};

class Coins extends Table<CoinParams> {
  protected name = "wp_ug_coins";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "customer_id int(11) NOT NULL",
    "amount int(11) NOT NULL DEFAULT 0",
    "agreement_id int(11) NULL",
    "price float(6, 2) NOT NULL DEFAULT 0.00",
    "created_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "updated_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "notes varchar(255) NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}

const coins = new Coins();
export default coins;
export type { CoinParams };
