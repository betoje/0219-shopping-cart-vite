// React 
// Cualquiera de las 2 formas de import funciona: 
// import { useState, useEffect, useReducer } from "react";
import React from 'react' 
// * no funciona:
// import ReactBootstrap from 'react-bootstrap'

// React Bootstrap
import {
  Card,
  Accordion,
  useAccordionButton,
  Button,
  Container,
  Row,
  Col,
  Navbar,
  NavDropdown,
  Image,
} from "react-bootstrap";
// Axios
import axios from "axios";

function App(props) {
  // React
  // * si funciona previo import React from 'react' 
  // * la alternativa es con solo previo import { useState, useEffect, useReducer } from "react"
  const { Fragment, useState, useEffect, useReducer } = React;
    
  // React Bootstrap
  // * uso de ReactBootstrap (previo import ReactBootstrap from 'react-bootstrap') 
  // * no funciona
  // const {
  //   Card,
  //   Accordion,
  //   Button,
  //   Container,
  //   Row,
  //   Col,
  //   Image,
  //   Input,
  // } = ReactBootstrap;

  // simulate getting products from DataBase
  const products = [
    { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
  ];
  
  const [items, setItems] = useState(products);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("http://localhost:1337/api/products");

  // componente Card no se usa
  const Cart = (props) => {
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);

    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };

  const useDataApi = (initialUrl, initialData) => {
    const [url, setUrl] = useState(initialUrl);
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);

    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };

  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };

  // fetch data
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock == 0) return;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    // beto:
    // item[0].instock = item[0].instock - 1;
    setCart([...cart, ...item]);
    // mark:
    let newItems = items.map((element, index) => {
      if(element.name === item[0].name) element.instock = element.instock - 1;
      return element;
    });
    setItems(newItems);
  };

  const deleteCartItem = (delIndex) => {
   // this is the index in the cart not in the Product List
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index);
    let newItems = items.map((item, index) => {
      if (item.name == target[0].name) item.instock = item.instock + 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };

  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049;
    let uhit = "https://picsum.photos/" + n;
    // let n = Math.floor(Math.random()*20) + 1049;
    // let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={uhit} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}:${item.cost}-Stock={item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

  // mark:
  function CustomToggle({children, eventKey}){
    const decoratedOnClick = useAccordionButton(eventKey, () => {
      console.log("custom toggle activated")
    });
    return (
      <Button
        type='button'
        variant='primary'
        onClick={decoratedOnClick}
      >
        {children}
      </Button>
    );    
  }

  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          {/* beto: */}
          {/* <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}> */}
          {/* <Accordion.Toggle  eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle> */}
          {/* mark: */}
          <CustomToggle eventKey={1 + index}>
            {item.name}
          </CustomToggle>

        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  // mark:
  // const restockProducts = (url) => {
  //   doFetch(url);
  //   let newItems = data.data.map((item) => {
  //     let {Name, Country, Cost, Instock} = item.attributes;
  //     let name = Name;
  //     let country = Country;
  //     let cost = Cost;
  //     let instock = Instock;
  //     return {name, country, cost, instock};
  //   });
  //   setItems([...items, ...newItems]);
  //   console.log(newItems);
  // };

  // beto:
  const restockProducts = async (url) => {
    try {
      const res = await axios.get(url);
      const newItems = res.data.data.map((item) => {
        return {
          name: item.attributes.name,
          country: item.attributes.country,
          cost: item.attributes.cost,
          instock: item.attributes.instock,
        };
      });
      // setItems([...items, ...newItems]);
      setItems([...products, ...newItems]);
    } catch (error) {
      console.error("fetch products error", error);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            // mark:
            // restockProducts(`http://localhost:1337/api/${query}`);
            // beto:
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
}

export default App;
