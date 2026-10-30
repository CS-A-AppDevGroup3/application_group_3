-- Document-Based Student Reviewer System : starting database (MySQL 8+)
-- One table per Model in the proposal: User, StudyFile, Section, Flashcard, Question, QuizAttempt
-- Run with:  mysql -u root -p < database/schema.sql      (or: npm run db:init)

CREATE DATABASE IF NOT EXISTS student_reviewer
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_reviewer;

-- ---------- User (single role: student) ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- JWTs are stateless, so logout works by recording the token's id (jti) here.
-- The auth middleware rejects any token found in this table.
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti        CHAR(36) NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (jti),
  KEY idx_revoked_expires (expires_at),
  CONSTRAINT fk_revoked_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- StudyFile ----------
CREATE TABLE IF NOT EXISTS study_files (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  original_name  VARCHAR(255) NOT NULL,
  stored_path    VARCHAR(500) NOT NULL,
  file_type      ENUM('pdf','docx','pptx','txt','image') NOT NULL,
  extracted_text LONGTEXT NULL,                       -- previewed/corrected by the user before generating
  status         ENUM('uploaded','extracted','generated') NOT NULL DEFAULT 'uploaded',
  uploaded_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_files_user (user_id),
  CONSTRAINT fk_files_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Section (the unit every generated item traces back to) ----------
CREATE TABLE IF NOT EXISTS sections (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  file_id       INT UNSIGNED NOT NULL,
  position      INT UNSIGNED NOT NULL,                -- order within the file
  heading       VARCHAR(255) NULL,
  page_number   INT UNSIGNED NULL,
  content       LONGTEXT NOT NULL,
  summary       TEXT NULL,
  key_points    JSON NULL,
  PRIMARY KEY (id),
  KEY idx_sections_file (file_id, position),
  CONSTRAINT fk_sections_file FOREIGN KEY (file_id) REFERENCES study_files(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Flashcard ----------
CREATE TABLE IF NOT EXISTS flashcards (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  file_id     INT UNSIGNED NOT NULL,
  section_id  INT UNSIGNED NOT NULL,                  -- NOT NULL enforces the file-only / traceable rule
  card_type   ENUM('term','definition','fact') NOT NULL,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cards_file (file_id),
  CONSTRAINT fk_cards_file    FOREIGN KEY (file_id)    REFERENCES study_files(id) ON DELETE CASCADE,
  CONSTRAINT fk_cards_section FOREIGN KEY (section_id) REFERENCES sections(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Question ----------
CREATE TABLE IF NOT EXISTS questions (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  file_id        INT UNSIGNED NOT NULL,
  section_id     INT UNSIGNED NOT NULL,               -- NOT NULL enforces the file-only / traceable rule
  question_type  ENUM('multiple_choice','true_false','identification','fill_blank') NOT NULL,
  question_text  TEXT NOT NULL,
  options        JSON NULL,                           -- choices for multiple_choice
  correct_answer TEXT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_questions_file (file_id),
  CONSTRAINT fk_questions_file    FOREIGN KEY (file_id)    REFERENCES study_files(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_section FOREIGN KEY (section_id) REFERENCES sections(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- QuizAttempt (+ per-item answers, used for "weak topics") ----------
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  file_id      INT UNSIGNED NOT NULL,
  score        INT UNSIGNED NOT NULL,
  total_items  INT UNSIGNED NOT NULL,
  taken_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempts_user (user_id, taken_at),
  CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE,
  CONSTRAINT fk_attempts_file FOREIGN KEY (file_id) REFERENCES study_files(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_answers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  attempt_id   INT UNSIGNED NOT NULL,
  question_id  INT UNSIGNED NOT NULL,
  given_answer TEXT NULL,
  is_correct   TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_answers_attempt (attempt_id),
  CONSTRAINT fk_answers_attempt  FOREIGN KEY (attempt_id)  REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id)     ON DELETE CASCADE
) ENGINE=InnoDB;
