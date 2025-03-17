BEGIN TRANSACTION;

CREATE TABLE groups (
    id INTEGER NOT NULL,
    parent_id INTEGER,
    name VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(parent_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE groups_members(
    group_id INTEGER NOT NULL,
	user_id	INTEGER NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(group_id, user_id),
	FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE projects_members RENAME TO projects_members_old;

CREATE TABLE projects_members (
	project_id	INTEGER NOT NULL,
	user_id	INTEGER,
	group_id INTEGER,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(project_id, user_id, group_id),
    UNIQUE(project_id,user_id) ON CONFLICT REPLACE,
    UNIQUE(project_id, group_id) ON CONFLICT REPLACE,
	FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
	FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO projects_members(project_id, user_id, created_at)
    SELECT project_id, user_id, created_at
    FROM projects_members_old;

COMMIT;

-- Once data are copied for sure

DROP TABLE projects_members_old;

-- Test data

INSERT INTO groups(id, name, parent_id) VALUES 
(1, "A", NULL),
(2, "B", NULL),
(3, "C", 1),
(4, "D", 2);

INSERT INTO groups_members(user_id, group_id) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 4),
(9, 1);

INSERT INTO projects(name) VALUES
('Test');

INSERT INTO projects_members(project_id, user_id, group_id) VALUES 
(5, 1, NULL),
(5, NULL, 1);