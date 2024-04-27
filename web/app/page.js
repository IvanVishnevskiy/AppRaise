'use client'
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Menu from "./menu";

const getUsers = async () => {
  const req = await fetch('http://localhost:3000/users');
  const res = await req.json();
  return res;
}

/**
 * Flatten the tree to an object with key: user.id, and value: link to parent object, link to user object
 * NOTE: this is not used, I tinkered with this function to calculate tree changes on the client,
 * and while I believe this would've been good for performance(less computation to do on the server),
 * it's too much work.
 * Alternatively, one could use a tree library npm package to do calculations on the client, but it was
 * more convenient to use tree functionality in TypeORM.
 * @param {*} nodes 
 * @param {*} parent 
 * @param {*} flatMap 
 * @returns 
 */
const flattenTree = (nodes = [], parent = null, flatMap = {}) => {
  if(!nodes.length) return;
  nodes.forEach(node => {
    const { children, id } = node;
    flatMap[id] = { node, children, parent };
    flattenTree(node.children, node, flatMap);
  })
  return flatMap;
}

/**
 * Component that renders the tree recursively
 * @param { data, onContextMenu } props 
 * @returns ReactNode
 */
function Tree({ data, onContextMenu, onMoveTo }) {
  const _createTree = (nodes, parent) => {
    if (!nodes.length) {
      return '';
    }
    return <ul className={ nodes.length > 1 ? styles.group : '' }>
      { nodes.map((node, i) => {
        return ( 
          <li key={ i }>
            <span onClick={() => onMoveTo(node.id)} onContextMenu={e => onContextMenu(e, node.id)} className={ styles.name }>{ node.name }</span>
              { _createTree(node.children, node) }
          </li>
        );
      })
      }
    </ul>
  }

  return <div className={ styles.tree }>{ _createTree(data) }</div>;
}

export default function Home() {
  const [ users, setUsers ] = useState([]);
  const [ contextWindow, setContextWindow ] = useState(false);
  const hideContext = () => {
    setContextWindow({ show: false });
  }
  const showContext = coords => { 
    setContextWindow({ show: true, coords });
    // remove isMoving flag, if we started moving someone but changed our mind and opened context window again
    if(isMoving) setIsMoving(false);
    
  };
  const [ interactId, setInteractId ] = useState('');
  const [ isMoving, setIsMoving ] = useState(false);

  // get users and update state
  useEffect(() => {
    // remove isMoving flag on Esc press
    const onKeyUp = ({ keyCode }) => {
      if(keyCode === 27) setIsMoving(false);
    }
    getUsers().then(setUsers);
    window.addEventListener('keyup', onKeyUp);
    return () => window.removeEventListener('keyup', onKeyUp);
  }, []);

  const onContextMenu = (e, interactId) => {
    e.preventDefault();
    e.stopPropagation();
    // remember which user we have interacted with
    setInteractId(interactId)
    showContext({ x: e.pageX, y: e.pageY });
  }

  const onCreate = async hasParent => {
    if(contextWindow.show) hideContext();
    if(isMoving) setIsMoving(false);
    
    const parentId = hasParent ? interactId : null;
    const name = prompt('Please, enter employee\'s name.');
    if(!name) return;

    const req = await fetch('http://localhost:3000/users/adduser', {
      method: 'POST',
      body: JSON.stringify({
        name,
        parentId
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const newUsers = await req.json();
    if(newUsers.error) return alert(newUsers.error);
    setUsers(newUsers);
  }

  const onMoveStart = () => {
    // alert('click on the user to move selected one to or press Esc to cancel moving');
    hideContext();
    setIsMoving(true);
  }

  const onMoveTo = async (targetId, ignoreIsMoving) => {
    if(contextWindow.show) hideContext();
    if(isMoving || ignoreIsMoving) {
      if(isMoving) setIsMoving(false);
      
      const req = await fetch('http://localhost:3000/users/setparent', {
        method: 'POST',
        body: JSON.stringify({
          userId: interactId,
          parentId: targetId
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const newUsers = await req.json();
      if(newUsers.error) return alert(newUsers.error);
      setUsers(newUsers);
    }
  }
  
  const onRemove = async () => {
    hideContext();
    const req = await fetch('http://localhost:3000/users/removeuser', {
      method: 'POST',
      body: JSON.stringify({
        userId: interactId
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const newUsers = await req.json();
    if(newUsers.error) return alert(newUsers.error);
    setUsers(newUsers);
  }

  return (
    <>
      <main className={styles.main}>
        <h1>Employees</h1>
        { isMoving ? <p className={styles.tutorial}>Click on employee to set selected its subordinate or press Esc to cancel</p> : ''}
        <br />
        { <Tree onContextMenu={ onContextMenu } onMoveTo={ onMoveTo } data={ users } /> }
        <button onClick={ () => onCreate(false) } className={styles.buttonAdd}>Add employee</button>
      </main>
      <Menu 
        windowData={ contextWindow }
        onShow={ showContext }
        onHide={ hideContext }
        onCreate={ () => onCreate(true) }
        onMoveStart={ onMoveStart }
        onMoveTo={ onMoveTo }
        onRemove={ onRemove }
      />
    </>
  );
}
