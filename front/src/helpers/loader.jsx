// credit https://loading.io/css/
import './loader.css';

function Loader(p) {
  return (
    <div className={`lds-ripple ${p.small ? 'lds-ripple-small' : ''}`}>
      <div></div>
      <div></div>
    </div>
  );
}
export { Loader };
