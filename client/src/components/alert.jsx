import React from 'react';

export const Alert = ({ message }) => {
  return (
    <div style={{ padding: '10px', backgroundColor: 'red', color: 'white' }}>
      {message || "This is an alert message"}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return (
    <div style={{ marginTop: '5px', fontSize: '12px', color: 'lightgray' }}>
      {children}
    </div>
  );
};
