import styles from "./menu.module.css"

export default function Menu({ windowData, onHide, onCreate, onMove, onRemove }) {
  const { show, coords } = windowData;
  const { x, y } = coords || {};

  return <div className={ `${styles.main} ${show ? styles.show : ''}` }>
    <ul className={ styles.list } style={{ left: x, top: y }}>
      <li onClick={ onCreate }>Add</li>
      <li onClick={ onMove }>Move</li>
      <li onClick={ onRemove }>Delete</li>
    </ul>
    <div onClick={ onHide } className={ styles.background }></div>
  </div>
}