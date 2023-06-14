import React, { useRef, useState } from "react";
import Moveable from "react-moveable";

import response from "./mocks/response.json";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  /**
   * fetchImage: Función asincrónica que obtiene una imagen de origen de datos.
   * Retorna la URL de la imagen obtenida.
   */
  const fetchImage = async () => {
    try {
      // online
      // const response = await fetch("https://jsonplaceholder.typicode.com/photos");
      // const data = await response.json();

      // local
      const data = await response;
      const randomIndex = Math.floor(Math.random() * data.length);
      const image = data[randomIndex].url;
      return image;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  /**
   * Agrega un nuevo componente moveable a la lista.
   */
  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const image = await fetchImage();

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        image: image,
        objectFit: Math.random() < 0.5 ? "cover" : "contain",
      },
    ]);
  };

  /**
   * updateMoveable: Actualiza las propiedades de un componente moveable con el ID especificado.
   * @param {number} id - El ID del componente a actualizar.
   * @param {object} newComponent - El objeto con las nuevas propiedades del componente.
   * @param {boolean} [updateEnd=false] - Indica si se trata de una actualización al finalizar.
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  /**
   * Elimina un componente moveable de la lista.
   * @param {number} id - El ID del componente a eliminar.
   */
  const removeMoveable = (id) => {
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );
    setMoveableComponents(updatedMoveables);
  };

  /**
   * handleResizeStart: Maneja el evento de inicio de redimensionamiento de un componente moveable.
   * @param {number} index - El índice del componente moveable.
   * @param {object} e - El evento de inicio de redimensionamiento.
   */
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "100%",
          width: "100%",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            removeMoveable={removeMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  removeMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  image,
  objectFit,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    image,
    objectFit,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  /**
   * onResize: Maneja el evento de redimensionamiento de un componente moveable.
   * @param {object} e - El evento de redimensionamiento.
   */
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      image,
      objectFit,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    // controla el tamaño
    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    // traduce un poco mejor las coordenadas
    if (top + translateY < 0) translateY = -top;
    if (left + translateX < 0) translateX = -left;

    if (top + translateY + newHeight > parentBounds?.height)
      translateY = parentBounds?.height - top - newHeight;
    if (left + translateX + newWidth > parentBounds?.width)
      translateX = parentBounds?.width - left - newWidth;

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  /**
   * onResizeEnd: Maneja el evento de finalización de redimensionamiento de un componente moveable.
   * @param {object} e - El evento de finalización de redimensionamiento.
   */
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    // Declarar e inicializar antes de usarlo
    let beforeTranslate = e.drag?.beforeTranslate || [0, 0];

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        image,
        objectFit,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: "url(" + image + ")",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: color,
        }}
        onClick={() => setSelected(id)}
      >
        <button
          onClick={() => removeMoveable(id)}
          style={{
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            color: "white",
            fontWeight: 600,
            border: "2px solid red",
            borderRadius: "10%",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          X
        </button>
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            image,
            objectFit,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
