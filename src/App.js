import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

 
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  const removeMoveable = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este componente?")) {
      const updatedMoveables = moveableComponents.filter((moveable) => moveable.id !== id);
      setMoveableComponents(updatedMoveables);
    }
  }


  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

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
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable</button>

      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            removeMoveable={removeMoveable}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  removeMoveable
}) => {
  const ref = useRef();
  const [imageUrl, setImageUrl] = useState([null]);
  const [lastUsedImage, setLastUsedImage] = useState([]);
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => {
        // Seleccionar una imagen aleatoria del arreglo que no sea la última utilizada
        let newImage;
        do {
          const newImageIndex = Math.floor(Math.random() * data.length);
          newImage = data[newImageIndex];
        } while (newImage.url === lastUsedImage);
  
        // Actualizar la última imagen utilizada
        setLastUsedImage(newImage.url);
        setImageUrl(newImage.url);
        console.log(newImage.url);
      });
  }, []);

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  const parentElement = document.getElementById("parent");

  
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
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onDrag = (e) => {
    // Obtén los límites del div "parent"
    let parent = document.getElementById("parent");
    let parentBounds = parent.getBoundingClientRect();
  
    // Obtén la nueva posición del componente
    let newTop = e.top;
    let newLeft = e.left;
  
    // Si la nueva posición del componente está fuera de los límites del div "parent", ajusta la posición para que no se salga
    if (newTop < parentBounds.top) newTop = parentBounds.top;
    if (newLeft < parentBounds.left) newLeft = parentBounds.left;
    if (newTop + e.height > parentBounds.bottom)
      newTop = parentBounds.bottom - e.height;
    if (newLeft + e.width > parentBounds.right)
      newLeft = parentBounds.right - e.width;
  
    // Actualiza la posición del componente con la nueva posición ajustada
    updateMoveable(id, { top: newTop, left: newLeft, width, height, color });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

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
          overflow: 'hidden', 
        }}
        onClick={() => setSelected(id)}>
          <button onClick={() => removeMoveable(id)} 
          style={{
            zIndex: 3, 
            top: '2em', 
            background: 'none', 
            color: 'white', 
            border: 'none'}}
          >X</button>
          <img src={imageUrl} alt="" />
           
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={onDrag}
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
