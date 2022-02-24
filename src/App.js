import React, {useEffect, useState} from 'react';
import './App.css';
import {API, Auth} from "aws-amplify";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";

const initialFormState = {name: "", description: ""};

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    getNotes();
  },[]);

  async function getNotes() {
    const apiData = await API.graphql({query: listNotes});
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: {input: formData},
    });
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  async function deleteNote({id}) {
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: {input: {id}},
    });
  }

  async function signOut() {
    await Auth.signOut();
    await window.location.reload();
  }

  function addNote(event) {
    event.preventDefault();
  }

  return (
      <div className="App">
        <h1>Notes App</h1>
        <div className="d-flex justify-content-center mt-4">
          <form className="w-50 px-5 shadow-lg p-3 mb-5 bg-white rounded" onSubmit={addNote}>
            <div className="d-flex flex-column align-items-center">
              <input
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Note title..."
                value={formData.name}
                className="form-control w-100 my-2"
              />
              <input
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Note description..."
                  value={formData.description}
                  className="form-control w-100 my-2"
              />
              <button className="btn btn-primary btn-lg my-2" onClick={createNote}>Create Note</button>
            </div>
          </form>
        </div>
          <div className="d-flex flex-row mb-5 ">
            {notes.map((note) => (
                <div className="card" style={{width: "15rem", margin: "1rem"}} key={note.name}>
                  <h5 className="card-title">{note.name}</h5>
                  <p className="card-text">{note.description}</p>
                  <button className="btn btn-primary" onClick={() => deleteNote(note)}>Delete Note</button>
                </div>
            ))}
          </div>
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary btn-lg" onClick={signOut}>Sign Out</button>
        </div>
        </div>
  );
}

export default withAuthenticator(App);
