CREATE DATABASE solarSystem;
USE solarSystem;

-- object type table
CREATE TABLE object_types (
    object_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- default type objects
 INSERT INTO object_type (type_name) VALUES ('satellite'), ('asteroid'), ('comet');

-- Planets table
CREATE TABLE planets (
    planet_id INT AUTO_INCREMENT PRIMARY KEY,
    planet_name VARCHAR(50) NOT NULL,
    radius FLOAT NOT NULL, -- Radio del planeta
    texture_url VARCHAR(255) NOT NULL,
    info_general TEXT NOT NULL,
    orbit_id INT NOT NULL,
    FOREIGN KEY (orbit_id) REFERENCES orbits(orbit_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- orbit table
CREATE TABLE orbits (
    orbit_id INT AUTO_INCREMENT PRIMARY KEY,
    orbit_name VARCHAR(50) NOT NULL,
    orbit_radius FLOAT NOT NULL, -- Radio orbital en millones de kilómetros
    position_x FLOAT NOT NULL,   -- Posición inicial en coordenadas X
    position_y FLOAT NOT NULL,   -- Posición inicial en coordenadas Y
    position_z FLOAT NOT NULL,   -- Posición inicial en coordenadas Z
) ENGINE=InnoDB;

-- object table
CREATE TABLE objects (
    object_id INT AUTO_INCREMENT PRIMARY KEY,
    object_name VARCHAR(50) NOT NULL,
    object_type_id INT NOT NULL, -- Relación con la tabla de tipos de objetos
    orbit_id INT NOT NULL, -- Relación con su órbita
    texture_url VARCHAR(255),
    info_url VARCHAR(255),
    FOREIGN KEY (object_type_id) REFERENCES object_types(object_type_id),
    FOREIGN KEY (orbit_id) REFERENCES orbits(orbit_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- satellite table
CREATE TABLE satellites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planet_id INT NOT NULL, -- Relación con el planeta que orbita
    satellite_name VARCHAR(50) NOT NULL,
    orbit_id INT NOT NULL, -- Relación con su órbita
    texture_url VARCHAR(255),
    info_url VARCHAR(255),
    FOREIGN KEY (planet_id) REFERENCES planets(planet_id) ON DELETE CASCADE,
    FOREIGN KEY (orbit_id) REFERENCES orbits(orbit_id) ON DELETE CASCADE
) ENGINE=InnoDB;

