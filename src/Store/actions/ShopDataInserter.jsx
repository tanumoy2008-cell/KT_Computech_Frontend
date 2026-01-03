import { toast } from "react-toastify";
import axios from "../../config/axios";
import { getData } from "../reducers/ShopReducer";

const getShopData = async (dispatch)=> {
    try {
        const res = await axios.get('/api/shop/shopData');
        const payload = res.data?.shopData ?? res.data;
        dispatch(getData(payload));
    } catch (err) {
        toast.info('Something is wrong on our site, we fix this.')
    }
}
export default getShopData;