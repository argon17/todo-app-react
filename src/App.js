import React, {useState} from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id }}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($text: String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {

  const [todoText, setTodoText] = useState("");
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText("")
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  async function handleToggleTodo({ id, done }){

    const data = await toggleTodo({ variables: {id, done: !done} });

    console.log(data);

  }
  
  async function handleAddTodo(e){
    e.preventDefault();
    if(!todoText.trim()) return;
    const data = await addTodo( {
      variables: {text: todoText},
      refetchQueries: [{query: GET_TODOS}]
    } );
    console.log(data);
  }
  
  async function handleDeleteTodo({ id }){
    const isConfirmed = window.confirm("Do you want to delete this todo?");
    if(isConfirmed){
      const data = await deleteTodo({
        variables: { id },
        update: cache => {
          const prevData = cache.readQuery( {query: GET_TODOS} )
          const newTodos = prevData.todos.filter(todo => todo.id !== id );
          cache.writeQuery({query: GET_TODOS, data: {todos: newTodos}})
        }
      });
      console.log(data);
    }
    
  }

  if(loading) return <div>Loading...</div>; 
  if(error) return <div>Error Occured!</div>
  return (
    <div className="App vh-100 sans-serif flex flex-column items-center bg-mid-gray white pa3 fl-1">

      <h1>
        Todo App{" "}
        <span role="img" aria-label="checkmark">📝</span>
      </h1>

      <form className="mb3 flex" onSubmit = {handleAddTodo}>
        <input 
          type="text"
          placeholder="add a todo" 
          className="pa2 f4" 
          onChange={event => setTodoText(event.target.value)}
          value={todoText}>
        </input>
        <button type="submit" className="pa2 ml2 f4 bg-navy white pointer">Create</button>
      </form>

      <div className="flex flex-column items-center justify-center">

        {data.todos.map(todo => (
        <p key={todo.id} onClick={()=>handleToggleTodo(todo)}>
          <span className={`pointer list pa1 white f3 ${todo.done && "strike" }`}>{todo.text}</span>
          <button className="bg-transparent bn f4 pointer" onClick={()=>handleDeleteTodo(todo)}>
            <span className="red"> &times; </span>
          </button>
        </p>

        ))}
      </div>
      
    </div>
  );
}

export default App;
