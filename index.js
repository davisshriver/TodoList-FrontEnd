// TodoList
// Features Added: Edit, myFetch, Completed Tasks List, Buttons to Complete and Incomplete tasks
// By Davis Shriver

function myFetch(url, params = {}) {
  return new Promise((res, rej) => {
    let xhr = new XMLHttpRequest();
    xhr.open(params.method || "GET", url);
    xhr.responseType = "json";

    for (let currHeader in params.headers) {
      xhr.setRequestHeader(currHeader, params.headers[currHeader]);
    }

    xhr.onload = () => {
      res(xhr.response);
    };

    xhr.onerror = () => {
      rej(new Error("Fetch Failed!"));
    };

    xhr.send(params.body);
  });
}

const APIs = (() => {
  const createTodo = (newTodo) => {
    return myFetch("http://localhost:3000/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: { "Content-Type": "application/json" },
    });
  };

  const deleteTodo = (id) => {
    return myFetch("http://localhost:3000/todos/" + id, {
      method: "DELETE",
    });
  };
  const updateTodo = (id, content) => {
    return myFetch("http://localhost:3000/todos/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
  };

  const getTodos = () => {
    return myFetch("http://localhost:3000/todos");
  };
  return { createTodo, deleteTodo, getTodos, updateTodo };
})();

const Model = (() => {
  class State {
    #todos; //private array
    #onChange; //function, will be called when setter function todos is called
    constructor() {
      this.#todos = [];
    }
    get todos() {
      return this.#todos;
    }
    set todos(newTodos) {
      // reassign value
      console.log("setter function");
      this.#todos = newTodos;
      this.#onChange?.(); // rendering
    }

    subscribe(callback) {
      //subscribe to the change of the state todos
      this.#onChange = callback;
    }
  }
  const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
  return {
    State,
    getTodos,
    createTodo,
    deleteTodo,
    updateTodo,
  };
})();

const View = (() => {
  const todolistEl = document.querySelector(".todo-list");
  const todolistFinEl = document.querySelector(".completed-list");

  const submitBtnEl = document.querySelector(".submit-btn");
  const inputEl = document.querySelector(".input");

  const renderTodos = (todos) => {
    let todosTemplate = "";
    let completedTemplate ="";
    // Add todos to the page as <li>
    todos.forEach((todo) => {
      // Incomplete task
      if(todo.completed === false)  {
        const liTemplate = `<li><span>${todo.content}</span><button class="edit-btn" id="${todo.id}">Edit</button>
                <button class="delete-btn" id="${todo.id}">Delete</button><button class="complete" id="${todo.id}">></button></li>`;
        todosTemplate += liTemplate;
      } // Complete task
      else {
        const liTemplate = `<li><button class="incomplete" id="${todo.id}"><</button><span>${todo.content}</span><button class="edit-btn" id="${todo.id}">Edit</button>
                <button class="delete-btn" id="${todo.id}">Delete</button></li>`;
        completedTemplate += liTemplate;
      }
      
                
    });

    todolistFinEl.innerHTML = completedTemplate;
    todolistEl.innerHTML = todosTemplate;

    // Check if lists are empty
    if (todos.length === 0) {
      todosTemplate = "<h4>No task(s) to display!</h4>";
      completedTemplate = "<h4>No task(s) to display!</h4>"
    }
    if(todolistEl.childElementCount === 0) {
      todosTemplate = "<h4>No task(s) to display!</h4>";
    }
    if(todolistFinEl.childElementCount === 0)  {
      completedTemplate = "<h4>No task(s) to display!</h4>";
    }
    // Update after empty check
    todolistFinEl.innerHTML = completedTemplate;
    todolistEl.innerHTML = todosTemplate;

  };

  const clearInput = () => {
    inputEl.value = "";
  };

  return { renderTodos, submitBtnEl, inputEl, todolistFinEl, clearInput, todolistEl };
})();

const Controller = ((view, model) => {
  let editCount = 0;
  const state = new model.State();
  const init = () => {
    model.getTodos().then((todos) => {
      todos.reverse();
      state.todos = todos;
    });
  };

  const handleSubmit = () => {
    view.submitBtnEl.addEventListener("click", (event) => {
      /* 
                1. read the value from input
                2. post request
                3. update view
            */
      const inputValue = view.inputEl.value;
      model.createTodo({ content: inputValue, completed: false }).then((data) => {
        state.todos = [data, ...state.todos];
        view.clearInput();
        console.log(state.todos);
      });
    });
  };

  // Delete normal
  const handleDelete = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "delete-btn") {
        const id = event.target.id;
        console.log("id", typeof id);
        model.deleteTodo(+id).then((data) => {
          state.todos = state.todos.filter((todo) => todo.id !== +id);
        });
      }
    });
  };

  // Delete from completed
  const handleDeleteC = () => {
    view.todolistFinEl.addEventListener("click", (event) => {
      if (event.target.className === "delete-btn") {
        const id = event.target.id;
        console.log("id", typeof id);
        model.deleteTodo(+id).then((data) => {
          state.todos = state.todos.filter((todo) => todo.id !== +id);
        });
      }
    });
  };

  // Function to add todos
  const handleUpdate = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "edit-btn") {
        if(editCount == 0)  {
          event.target.previousSibling.setAttribute('contentEditable',true);
          event.target.previousSibling.style.backgroundColor = "#ccffff";
          event.target.previousSibling.style.padding = "5px";
          editCount++;
        }
        else {
          // Do code here
          event.target.previousSibling.setAttribute('contentEditable',false);
          let cnt = event.target.previousSibling.innerText;
          console.log(cnt);
          const id = event.target.id;
          console.log("id", typeof id);

          model.updateTodo(+id, { content: cnt }).then((data) => {
          let index = state.todos.findIndex((item) => item.id === +id);
          state.todos[index].content = cnt;
          view.renderTodos(state.todos);
          console.log(state.todos[index]);
        });
          editCount = 0;
        }
      }
    });
  };

    // Function to add todos
    const handleUpdateC = () => {
      view.todolistFinEl.addEventListener("click", (event) => {
        if (event.target.className === "edit-btn") {
          if(editCount == 0)  {
            event.target.previousSibling.setAttribute('contentEditable',true);
            event.target.previousSibling.style.backgroundColor = "#ccffff";
            event.target.previousSibling.style.padding = "5px";
            editCount++;
          }
          else {
            // Do code here
            event.target.previousSibling.setAttribute('contentEditable',false);
            
            let cnt = event.target.previousSibling.innerText;
            console.log(cnt);
            const id = event.target.id;
            console.log("id", typeof id);
  
            model.updateTodo(+id, { content: cnt }).then((data) => {
            let index = state.todos.findIndex((item) => item.id === +id);
            state.todos[index].content = cnt;
            view.renderTodos(state.todos);
            console.log(state.todos[index]);
          });
            editCount = 0;
          }
          
        }
      });
    };

    // Function to complete todos
  const handleComplete = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "complete") {
        const id = event.target.id;
        console.log(+id);

        model.updateTodo(+id, { completed: true }).then((data) => {
          let index = state.todos.findIndex((item) => item.id === +id);
          state.todos[index].completed = true;
          view.renderTodos(state.todos);
          console.log(state.todos[index]);
        });
      }
    });
  };

    // Function to complete todos
    const handleIncomplete = () => {
      view.todolistFinEl.addEventListener("click", (event) => {
        if (event.target.className === "incomplete") {
          const id = event.target.id;
          console.log(+id);
  
          model.updateTodo(+id, { completed: false }).then((data) => {
            let index = state.todos.findIndex((item) => item.id === +id);
            state.todos[index].completed = false;
            view.renderTodos(state.todos);
            console.log(state.todos[index]);
          });
        }
      });
    };

  const bootstrap = () => {
    init();
    handleSubmit();
    handleDelete();
    handleDeleteC();
    handleUpdate();
    handleUpdateC();
    handleComplete();
    handleIncomplete();
    state.subscribe(() => {
      view.renderTodos(state.todos);
    });
  };
  return {
    bootstrap,
  };
})(View, Model); //ViewModel

Controller.bootstrap();
