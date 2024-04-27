import styles from "./menu.module.css";
import { createContext } from "react";

export const showContextMenuState = createContext(false);

export default function Menu({ windowData, onHide, onCreate, onMoveTo, onMoveStart, onRemove }) {
  const { show, coords } = windowData;
  const { x, y } = coords || {};

  return <div className={ `${styles.main} ${show ? styles.show : ''}` }>
    <ul className={ styles.list } style={{ left: x, top: y }}>
      <li onClick={ onCreate }>Add</li>
      <li onClick={ onMoveStart }>Move</li>
      {/* Ideally pass data if this employee has a parent or not so we don't show this to ones who're already at tree base */}
      <li onClick={ () => onMoveTo(null, true) }>Make boss</li>
      <li onClick={ onRemove }>Delete</li>
    </ul>
    <div onClick={ onHide } className={ styles.background }></div>
  </div>
}