DROP TABLE IF EXISTS digimon;

CREATE TABLE digimon(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    img VARCHAR(255),
    level VARCHAR(255) 
);
INSERT INTO digimon(name,img,level)VALUES('Yokomon','https://digimon.shadowsmith.com/img/yokomon.jpg','In Training');