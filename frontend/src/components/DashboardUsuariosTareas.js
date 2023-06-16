import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../utils/api';

const DashboardUsuariosTareas = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTareasUsuarioModal, setShowTareasUsuarioModal] = useState(false);
  const [tareasUsuario, setTareasUsuario] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tarea, setTarea] = useState('');
  const [tareas, setTareas] = useState([]);

  const Logout = async (e) => {
    e.preventDefault();
    const res = await api.logout();
    if (res.status === 200) {
      localStorage.removeItem('token');
      window.location.reload(false);
    } else {
      alert('Something went wrong');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'En progreso';
      case 3:
        return 'Completada';
      default:
        return '';
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    //refresh page
    window.location.reload(false);
  };

  const openTareasUsuarioModal = async (usuario_id) => {
    setSelectedUserId(usuario_id);
    await GetTareasUsuario(usuario_id);
    setShowTareasUsuarioModal(true);
  };

  const closeTareasUsuarioModal = () => {
    setShowTareasUsuarioModal(false);
    setSelectedUserId(null);
  };

  const GetUsuarios = async () => {
    const res = await api.getUsuarios();
    if (res.status === 200) {
      const data = await res.json();
      // filter out admin user
      const newUsuarios = data.filter(usuario => usuario.correo !== 'admin@admin.com');
      setUsuarios(newUsuarios);
    } else {
      alert('Something went wrong');
    }
  };

  useEffect(() => {
    GetUsuarios();
  }, []);

  const CreateUsuario = async (e) => {
    e.preventDefault();
    const res = await api.createUsuario(correo, contraseña);
    if (res.status === 200) {
      const data = await res.json();
      const newUsuarios = [...usuarios, data];
      setUsuarios(newUsuarios);
      closeCreateModal();
    } else {
      alert('Something went wrong');
    }
  };

  const DeleteUsuario = async (id) => {
    const res = await api.deleteUsuario(id);
    if (res.status === 200) {
      const newUsuarios = usuarios.filter(usuario => usuario.id !== id);
      setUsuarios(newUsuarios);
    } else {
      alert('Something went wrong');
    }
  };

  const GetTareasUsuario = async (usuario_id) => {
    const res = await api.getTareasUsuario(usuario_id);
    if (res.status === 200) {
      const data = await res.json();
      setTareasUsuario(data);
    } else {
      alert('Something went wrong');
    }
  };

  const DeleteTareaUsuario = async (id) => {
    const res = await api.deleteTareaUsuario(id);
    if (res.status === 200) {
      const newTareasUsuario = tareasUsuario.filter(tarea => tarea.id !== id);
      setTareasUsuario(newTareasUsuario);
    } else {
      alert('Something went wrong');
    }
  };

  const CreateTareaUsuario = async (e) => {
    e.preventDefault();
    const res = await api.createTareaUsuario(selectedUserId, tarea);
    if (res.status === 200) {
      const data = await res.json();
      const newTareasUsuario = [...tareasUsuario, data];
      setTareasUsuario(newTareasUsuario);
      setTarea('');
      await GetTareasUsuario(selectedUserId);
    }
    else if (res.status === 400) {
      alert('El usuario ya tiene la tarea asignada.');
    }
    else {
      alert('Something went wrong');
    }
  };

  const GetTareas = async () => {
    const res = await api.getTareas();
    if (res.status === 200) {
      const data = await res.json();
      setTareas(data);
    } else {
      alert('Something went wrong');
    }
  };

  useEffect(() => {
    GetTareas();
  }, []);

  return (
    <div className="container">
      <div>
        <h1>Usuarios</h1>
        <button className='add-button' onClick={openCreateModal}>Crear Usuario</button>
        <button className='add-button' onClick={() => navigate('/')}>Regresar a inicio</button>
        <button className='delete-button' onClick={Logout}>Cerrar sesión</button>
        <table className='registers-table'>
          <thead className='registers-th'>
            <tr>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.correo}</td>
                <td>
                  <button className= 'add-button' onClick={() => openTareasUsuarioModal(usuario.id)}>Ver tareas</button>
                  <button className= 'delete-button' onClick={() => DeleteUsuario(usuario.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Crear Usuario</h2>
            <form className="form-modal">
              <label htmlFor="correo">Correo:</label>
              <br />
              <input type="text" id="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              <br />
              <label htmlFor="contraseña">Contraseña:</label>
              <br />
              <input type="password" id="contraseña" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
              <br />
              <button type="submit" onClick={CreateUsuario}>Crear</button>
              <button onClick={closeCreateModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {showTareasUsuarioModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tareas de Usuario</h2>
            <h3>Correo: {usuarios.find(usuario => usuario.id === selectedUserId)?.correo}</h3>
            <form className="form-modal">
              <label htmlFor="tarea">Agregar tarea:</label>
              <br />
              <select className='select-tarea' id="tarea" value={tarea} onChange={(e) => setTarea(e.target.value)}>
                <option value="">Seleccionar tarea</option>
                {tareas.map(tarea => (
                  <option key={tarea.id} value={tarea.id}>{tarea.titulo}</option>
                ))}
              </select>
              <button type="submit" className='add-button' onClick={CreateTareaUsuario}>Agregar</button>
            </form>
            <table className='tareas-table'>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Fecha Límite</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tareasUsuario.map(tarea => (
                  <tr key={tarea.id}>
                    <td>{tarea.titulo}</td>
                    <td>{tarea.descripcion}</td>
                    <td>{formatDate(tarea.fecha_venc)}</td>
                    <td>{getStatusLabel(tarea.estado_id)}</td>
                    <td>
                      <button className='delete-button' onClick={() => DeleteTareaUsuario(tarea.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className='action-button' onClick={closeTareasUsuarioModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUsuariosTareas;