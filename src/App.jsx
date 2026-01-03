import { useEffect } from 'react';
import TostContainer from './components/TostContainer'
import AllRouter from './routes/AllRouter';
import getShopData from './Store/actions/ShopDataInserter';
import { useDispatch } from 'react-redux';

const App = () => {
  const dispatch = useDispatch();
  useEffect(()=>{
    getShopData(dispatch);
  },[])
  return (
    <>
    <TostContainer />
    <AllRouter />
    </>
  )
}

export default App