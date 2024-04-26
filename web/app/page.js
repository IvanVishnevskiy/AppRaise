'use client'
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Menu from "./menu";

const getUsers = async () => {
  const req = await fetch('http://localhost:3000/users');
  const res = await req.json();
  return res;
}

function Tree({ data, onContextMenu }) {
  const _createTree = nodes => {
    if (!nodes.length) {
      return '';
    }
    return <ul className={ nodes.length > 1 ? styles.group : '' }>
      { nodes.map((node, i) => {
        return <li key={i}><span onContextMenu={e => onContextMenu(e, node)} className={ styles.name }>{ node.name }</span>{ _createTree(node.children) }</li>;
      })
      }
    </ul>
  }

  return <div className={styles.tree}>{ _createTree(data) }</div>;
}

export default function Home() {
  const [ users, setUsers ] = useState([]);
  const [ contextWindow, setContextWindow ] = useState(false);
  const hideContext = () => setContextWindow({ show: false });
  const showContext = coords => setContextWindow({ show: true, coords });
  const [ currentUser, setCurrentUser ] = useState({});
  // get users and update state
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const onContextMenu = e => {
    console.log(e)
    e.preventDefault();
    e.stopPropagation();
    showContext({ x: e.clientX, y: e.clientY });
  }

  const onCreate = () => {
    alert('create');
  }

  const onMove = () => {
    alert('move');

  }
  
  const onRemove = () => {
    alert('delete');
  }

  return (
    <main className={styles.main}>
      <h1>Employees</h1>
      <br />
      { <Tree onContextMenu={onContextMenu} data={ users } /> }
      <Menu 
        windowData={ contextWindow }
        onShow={ showContext }
        onHide={ hideContext }
        onCreate={ onCreate }
        onMove={ onMove }
        onRemove={ onRemove }
      />
    </main>
  );
}
