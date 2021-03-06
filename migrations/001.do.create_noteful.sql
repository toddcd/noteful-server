CREATE TABLE folders (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL
)

CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  modified DATE DEFAULT now(),
  folderId INTEGER REFERENCES folders(id) NOT null,
  content TEXT
);
