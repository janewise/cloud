import React, {useEffect, useState} from "react";
import './displayStats.css';
import coin from "../../assets/click.png";

export function DisplayStats(props : {
  clickIncrement : number, 
  autoIncrement: number,
  balanceRef: React.MutableRefObject<{value: number;}>,
  refillRate: number,
}){

  function addcomma(x:any) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  const formatNumber = (n: number) => {
    if (n < 1e6) return n;
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "G";
    if (n >= 1e12 && n < 1e15) return +(n / 1e12).toFixed(1) + "T";
    if (n >= 1e15 && n < 1e18) return +(n / 1e15).toFixed(1) + "P";
    if (n >= 1e18 && n < 1e21) return +(n / 1e18).toFixed(1) + "E";
    if (n >= 1e21 && n < 1e24) return +(n / 1e21).toFixed(1) + "Z";
    if (n >= 1e24) return +(n / 1e24).toFixed(1) + "Y";
  };
  /*
    displayBalance and setDisplayBalance is used to keep
    displayed balanced updated every 10ms so user doesn't feel the UI lag.
    This will keep the app feeling instantaneous while in fact only this component
    is reloaded every 10ms while the whole app is only updated every 100ms. 
  */
  const [displayBalance, setDisplayBalance] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayBalance(props.balanceRef.current.value);
    }, 10);

    return () => clearInterval(interval);
  })

  return(
    // routerchange
    <div className="stats">
      <h1>
        
          <img src={coin} width={35} height={35} alt="coin" />
        <span> </span>
        {addcomma(formatNumber(Math.trunc(displayBalance)))}</h1>
      <div className="row">
        <div className="col-6"><p><span> Profit:</span> {addcomma(formatNumber(props.autoIncrement*3600))} /h</p></div>
      <div className="col-6"> <p><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-ev-station" viewBox="0 0 16 16">
  <path d="M3.5 2a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5zm2.131 10.46H4.14v-.893h1.403v-.505H4.14v-.855h1.49v-.54H3.485V13h2.146zm1.316.54h.794l1.106-3.333h-.733l-.74 2.615h-.031l-.747-2.615h-.764z"/>
  <path d="M3 0a2 2 0 0 0-2 2v13H.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1H11v-4a1 1 0 0 1 1 1v.5a1.5 1.5 0 0 0 3 0V4a.5.5 0 0 0-.146-.354l-.5-.5a.5.5 0 0 0-.707 0l-.5.5A.5.5 0 0 0 13 4v3c0 .71.38 1.096.636 1.357l.007.008c.253.258.357.377.357.635v3.5a.5.5 0 1 1-1 0V12a2 2 0 0 0-2-2V2a2 2 0 0 0-2-2zm7 2v13H2V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
</svg> {props.refillRate}/s</p></div>
      </div>
    </div>
  )
}