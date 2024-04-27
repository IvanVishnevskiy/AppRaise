'use client'
import styles from "./page.module.css";
import { useState, useEffect, useContext } from "react";
import Menu from "./menu";
import { showContextMenuState } from "./menu";

const getUsers = async () => {
  const req = await fetch('http://localhost:3000/users');
  const res = await req.json();
  return res;
}

/**
 * Flatten the tree to an object with key: user.id, and value: link to parent object, link to user object
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
  const hideContext = () => setContextWindow({ show: false });
  const showContext = coords => { 
    setContextWindow({ show: true, coords });
    // remove isMoving flag, if we started moving someone but changed our mind and opened context window again
    if(isMoving) {
      setIsMoving(false);
    }
  };
  const [ interactId, setInteractId ] = useState('');
  const [ isMoving, setIsMoving ] = useState(false);
  // this could become troublesome with large trees, but should work just fine here. 
  // Ideally we should move this closer to root and only do these calculations on tree changes.
  // We could also look into memoization.
  const flatMap = flattenTree(users);

  // get users and update state
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const onContextMenu = (e, interactId) => {
    e.preventDefault();
    e.stopPropagation();
    // remember which user we have interacted with
    setInteractId(interactId)
    showContext({ x: e.pageX, y: e.pageY });
  }

  const onCreate = async hasParent => {
    console.log(hasParent)
    if(isMoving) {
      setIsMoving(false);
    }
    const parentId = hasParent ? interactId : null;
    const name = prompt('Please, enter employee\'s name.');
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
    const { error, id } = await req.json();
    if(error) return alert(error);
    else if(hasParent) {
      flatMap[parentId].children.push({ id, name, children: []});
      console.log(1)
      setUsers([...users]);
    } else {
      console.log(2)
      setUsers([...users]);
    }
  }

  const onMoveStart = () => {
    alert('click on the user to move selected one to or press Esc to cancel moving');
    hideContext();
    setIsMoving(true);
  }

  const onMoveTo = async (targetId, ignoreIsMoving) => {
    if(isMoving || ignoreIsMoving) {
      if(isMoving) setIsMoving(false);
      if(contextWindow.show) hideContext();
      let newParent = targetId ? flatMap[targetId] : null;
      let { node, parent } = flatMap[interactId];
      if(newParent?.node?.id === parent?.id) {
        // This requires clarification, but I decided that moving nodes with children on client is outside of the assessment scope.
        // However, it would be easy to achieve if we simply calculated the tree in the database each time we write to it,
        // but that would mean more computation to be done on the backend, which is not usually preferred.
        return alert('Can\'t move employees with subordinates')
      };
      
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
      const { error } = await req.json();
      if(error) return alert(error);

      if(parent) {
        parent.children = parent.children.filter(({ id } ) => id !== node.id);
      } else {
        setUsers(users.filter(({ id } ) => id !== node.id));
      }
      if(newParent) {
        newParent.children.push(node);
        setUsers([...users]);
      } else {
        users.push(node);
        setUsers([...users]);
      }
    }
  }
  
  const onRemove = async () => {
    const parent = flatMap[interactId].parent;
    const node = flatMap[interactId];
    if(node.children.length !== 0) {
      // or we could do that and move them to the parent's parent or to the base of the tree. Outside of the scope, I believe.
      return alert('Can\'t remove someone who has subordinates');
    }
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
    const { error } = await req.json();
    if(error) return alert(error);
    // if there is parent ref, delete the child we're interacting with. We don't need to do anything else
    // because this object is a link, so by removing it here we remove it in the real tree.
    if(parent) parent.children = parent.children.filter(({ id } ) => id !== interactId);
    // if there's no parent, we are interacting with the starting node, remove it directly from the tree
    else setUsers(users.filter(({ id }) => id !== interactId));
    hideContext();
  }

  return (
    <>
      <main className={styles.main}>
        <h1>Employees</h1>
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
