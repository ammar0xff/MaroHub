import sys
import json
import shutil
import os
import requests
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QTableWidget, QTableWidgetItem,
    QPushButton, QLineEdit, QLabel, QHeaderView, QMessageBox, QDialog, QTextEdit,
    QHBoxLayout, QFileDialog, QInputDialog, QFormLayout, QDialogButtonBox,
    QCheckBox, QSpinBox, QSizePolicy, QScrollArea
)
from PyQt6.QtCore import Qt, QObject, pyqtSignal, QDateTime
from PyQt6.QtGui import QColor, QFont

# Optional: For parsing HTML descriptions from RAWG
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
    print("BeautifulSoup not found. RAWG descriptions will not be stripped of HTML.")


# --- RAWG API Configuration ---
# IMPORTANT: Replace with your actual RAWG API key
RAWG_API_KEY = "682f7cee2ec84ede97f770e0521eb2f5"  # Get this from rawg.io/apidocs
RAWG_BASE_URL = "https://api.rawg.io/api/games"
# ------------------------------

class GameManager(QObject):
    """
    Manages game data, including loading, saving, and manipulating game entries.
    Handles interaction with games.json and games_clone.json.
    Emits signals when data changes.
    """
    games_updated = pyqtSignal(list)
    error_occurred = pyqtSignal(str)
    info_message = pyqtSignal(str)

    def __init__(self, original_file="games.json", clone_file="games_clone.json"):
        super().__init__()
        self.original_file = original_file
        self.clone_file = clone_file
        self._games = []
        self.prepare_clone_file()
        self.load_games()

    def prepare_clone_file(self) -> None:
        """
        Ensures the original game file exists and creates/updates the clone file.
        """
        if not os.path.exists(self.original_file):
            try:
                with open(self.original_file, "w") as f:
                    json.dump([], f)
                self.info_message.emit(f"Created empty {self.original_file} as it did not exist.")
            except Exception as e:
                self.error_occurred.emit(f"Failed to create {self.original_file}: {e}")
                return

        try:
            # If clone doesn't exist or original is newer, copy original to clone
            if not os.path.exists(self.clone_file) or \
               os.path.getmtime(self.original_file) > os.path.getmtime(self.clone_file):
                shutil.copy(self.original_file, self.clone_file)
                self.info_message.emit(f"Cloned {self.original_file} to {self.clone_file}.")
        except Exception as e:
            self.error_occurred.emit(f"Failed to clone games: {e}")

    def load_games(self) -> None:
        """
        Loads game data from the clone file.
        """
        try:
            with open(self.clone_file, "r") as f:
                self._games = json.load(f)
            self._check_all_games_correctness()
            self.games_updated.emit(self._games)
            self.info_message.emit(f"Loaded {len(self._games)} games from {self.clone_file}.")
        except json.JSONDecodeError as e:
            self.error_occurred.emit(f"Failed to parse {self.clone_file}. Please check its format: {e}")
            self._games = []
            self.games_updated.emit(self._games) # Emit empty list on error
        except FileNotFoundError:
            self.error_occurred.emit(f"{self.clone_file} not found. Creating an empty list.")
            self._games = []
            self.games_updated.emit(self._games) # Emit empty list on error
        except Exception as e:
            self.error_occurred.emit(f"Failed to load games from {self.clone_file}: {e}")
            self._games = []
            self.games_updated.emit(self._games) # Emit empty list on error

    def save_games(self, silent: bool = False) -> None:
        """Saves the current game data to the clone file."""
        try:
            with open(self.clone_file, "w") as f:
                json.dump(self._games, f, indent=4)
            if not silent:
                self.info_message.emit(f"Games saved to {self.clone_file}.")
        except Exception as e:
            self.error_occurred.emit(f"Failed to save games to {self.clone_file}: {e}")

    def reset_clone(self) -> None:
        """
        Resets the clone file to the state of the original file.
        """
        try:
            shutil.copy(self.original_file, self.clone_file)
            self.load_games()
            self.info_message.emit("Clone reset to original successfully.")
        except Exception as e:
            self.error_occurred.emit(f"Failed to reset clone: {e}")

    def save_to_original(self) -> None:
        """
        Saves the current game data from the clone file to the original file.
        """
        try:
            with open(self.original_file, "w") as f:
                json.dump(self._games, f, indent=4)
            self.info_message.emit("Current games saved to games.json successfully.")
        except Exception as e:
            self.error_occurred.emit(f"Failed to save to original {self.original_file}: {e}")

    def add_game(self, game_data: dict) -> None:
        """Adds a new game to the list."""
        # Add default values for new fields if not provided by RAWG or user
        # This acts as a schema for new entries
        default_game_structure = {
            "name": "",
            "original_torrent_name": "",
            "cleaned_search_name": "",
            "magnet": "",
            "size": "",
            "version": "",
            "release_group": "",
            "edition_info": None,
            "languages_info": "",
            "is_native_linux_torrent": False,
            "is_wine_bottled_torrent": False,
            "other_torrent_tags": [],
            "genres": [],
            "platforms": [],
            "platform_type": "",
            "description": "",
            "release_date": "",
            "metacritic": None,
            "rawg_id": None,  # New field
            "thumbnail": "",
            "background_image": "",
            "screenshots": [],
            "hidden": False,
            "is_correct": False # Will be calculated
        }
        
        # Merge default structure with provided game_data, allowing game_data to override
        full_game_data = {**default_game_structure, **game_data}

        # Basic validation for essential fields
        if not self._validate_game_data(full_game_data):
            self.error_occurred.emit("Cannot add game: Missing essential fields (name, original_torrent_name, description).")
            return

        # Check for duplicate 'original_torrent_name' before adding
        if any(g.get("original_torrent_name") == full_game_data["original_torrent_name"] for g in self._games):
            self.error_occurred.emit(f"Game with original torrent name '{full_game_data['original_torrent_name']}' already exists.")
            return

        full_game_data["is_correct"] = self._check_game_correctness(full_game_data)
        self._games.append(full_game_data)
        self.save_games()
        self.games_updated.emit(self._games)
        self.info_message.emit(f"Game '{full_game_data.get('name', 'Unknown')}' added.")

    def update_game(self, original_torrent_name: str, updated_data: dict, silent: bool = False) -> None:
        """
        Updates an existing game's data.
        Identifies the game by its original_torrent_name.
        """
        try:
            # Find the game by its unique identifier (original_torrent_name)
            game_to_update = None
            index = -1
            for i, game in enumerate(self._games):
                if game.get("original_torrent_name") == original_torrent_name:
                    game_to_update = game
                    index = i
                    break

            if game_to_update is None:
                self.error_occurred.emit(f"Error: Game with original torrent name '{original_torrent_name}' not found for update. Please refresh.")
                return
            
            # Basic validation for essential fields in updated data
            if not self._validate_game_data(updated_data):
                self.error_occurred.emit("Cannot update game: Missing essential fields (name, original_torrent_name, description).")
                return

            # Prevent changing original_torrent_name to an existing one if it's an edit
            # and the new name is different from the old one.
            new_torrent_name = updated_data.get("original_torrent_name")
            if new_torrent_name != original_torrent_name:
                if any(g.get("original_torrent_name") == new_torrent_name for i, g in enumerate(self._games) if i != index):
                    self.error_occurred.emit(f"Cannot update: Another game with original torrent name '{new_torrent_name}' already exists.")
                    return

            # Update all fields from updated_data. This ensures any field modified in the dialog
            # or fetched from RAWG is applied.
            for key, value in updated_data.items():
                self._games[index][key] = value
            self._games[index]["is_correct"] = self._check_game_correctness(self._games[index])
            self.save_games(silent=silent)
            self.games_updated.emit(self._games)
            if not silent:
                self.info_message.emit(f"Game '{updated_data.get('name', 'Unknown')}' updated.")
        except Exception as e:
            self.error_occurred.emit(f"Failed to update game: {e}")

    def delete_games(self, games_to_delete: list[dict]) -> None:
        """Deletes specified games from the list."""
        initial_count = len(self._games)
        # Filter out games that are in games_to_delete. Use original_torrent_name for robust comparison.
        deleted_torrent_names = {g.get("original_torrent_name") for g in games_to_delete if g.get("original_torrent_name")}
        self._games = [game for game in self._games if game.get("original_torrent_name") not in deleted_torrent_names]
        
        if len(self._games) < initial_count:
            self.save_games()
            self.games_updated.emit(self._games)
            self.info_message.emit(f"Deleted {initial_count - len(self._games)} game(s).")
        else:
            self.info_message.emit("No games were deleted.")

    def hide_games(self, games_to_hide: list[dict]) -> None:
        """Marks specified games as hidden."""
        hidden_torrent_names = {g.get("original_torrent_name") for g in games_to_hide if g.get("original_torrent_name")}
        for game in self._games:
            if game.get("original_torrent_name") in hidden_torrent_names:
                game["hidden"] = True
        self.save_games()
        self.games_updated.emit(self._games)
        self.info_message.emit(f"Hid {len(games_to_hide)} game(s).")

    def get_all_games(self) -> list[dict]:
        """Returns the complete list of games."""
        return self._games

    def _check_all_games_correctness(self) -> None:
        """Checks correctness for all games in the loaded list."""
        for game in self._games:
            game["is_correct"] = self._check_game_correctness(game)

    def _check_game_correctness(self, game_entry: dict) -> bool:
        """
        Determines if the game name and original torrent name align.
        Specifically checks if the first word of the game name matches
        the first word of the (normalized) original torrent name.
        """
        game_name = game_entry.get("name", "").lower().strip()
        torrent_name = game_entry.get("original_torrent_name", "").lower().strip()

        if not game_name or not torrent_name:
            return False

        first_word_game = game_name.split(' ')[0]
        
        # Normalize torrent name by replacing common separators with spaces
        torrent_name_normalized = torrent_name.replace('.', ' ').replace('-', ' ').replace('_', ' ')
        first_word_torrent = torrent_name_normalized.split(' ')[0]

        return first_word_game == first_word_torrent and first_word_game != ''

    def _validate_game_data(self, game_data: dict) -> bool:
        """Checks if essential game data fields are non-empty."""
        # Only validate name, original_torrent_name, description as core for this app
        return bool(game_data.get("name") and game_data.get("original_torrent_name") and game_data.get("description"))

    def fetch_game_data_from_rawg(self, query: str | None = None, current_rawg_id: int | None = None, silent: bool = False) -> dict | None:
        """
        Fetches game data from RAWG API.
        If silent=True, suppresses UI messages and prints to terminal instead.
        """
        if not RAWG_API_KEY or RAWG_API_KEY == "YOUR_RAWG_API_KEY":
            msg = "Please set your RAWG_API_KEY in the script to use this feature."
            if silent:
                print(msg)
            else:
                self.error_occurred.emit(msg)
            return None

        params = {"key": RAWG_API_KEY}
        detail_data = None

        if query:
            query = query.strip()

        # 1. Try fetching by query if it's a positive integer ID
        if query and query.isdigit() and int(query) > 0:
            potential_id = int(query)
            url = f"{RAWG_BASE_URL}/{potential_id}"
            msg = f"Attempting to fetch RAWG data by user-provided ID: {potential_id}..."
            if silent:
                print(msg)
            else:
                self.info_message.emit(msg)
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                detail_data = response.json()
                if detail_data:
                    msg = f"Successfully fetched RAWG data for ID {potential_id}."
                    if silent:
                        print(msg)
                    else:
                        self.info_message.emit(msg)
            except requests.exceptions.HTTPError as e:
                msg = f"RAWG ID fetch HTTP error ({e.response.status_code}): {e.response.text}. Trying other methods..."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except requests.exceptions.RequestException as e:
                msg = f"RAWG ID fetch failed: {e}. Trying other methods..."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except json.JSONDecodeError:
                msg = "RAWG ID fetch failed: Could not decode JSON. Trying other methods..."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)

        # 2. Try by current_rawg_id
        if detail_data is None and not query and current_rawg_id and current_rawg_id > 0:
            url = f"{RAWG_BASE_URL}/{current_rawg_id}"
            msg = f"Attempting to fetch RAWG data by existing ID: {current_rawg_id}..."
            if silent:
                print(msg)
            else:
                self.info_message.emit(msg)
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                detail_data = response.json()
                if detail_data:
                    msg = f"Successfully fetched RAWG data for ID {current_rawg_id}."
                    if silent:
                        print(msg)
                    else:
                        self.info_message.emit(msg)
            except requests.exceptions.HTTPError as e:
                msg = f"RAWG existing ID fetch HTTP error ({e.response.status_code}): {e.response.text}. No further attempts."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except requests.exceptions.RequestException as e:
                msg = f"RAWG existing ID fetch failed: {e}. No further attempts."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except json.JSONDecodeError:
                msg = "RAWG existing ID fetch failed: Could not decode JSON. No further attempts."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)

        # 3. Try by name search
        if detail_data is None and query and (not query.isdigit() or int(query) == 0):
            params["search"] = query
            url = RAWG_BASE_URL
            msg = f"Attempting to fetch RAWG data by name search: '{query}'..."
            if silent:
                print(msg)
            else:
                self.info_message.emit(msg)
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                if data and data.get("results"):
                    first_result_id = data["results"][0]["id"]
                    detail_url = f"{RAWG_BASE_URL}/{first_result_id}"
                    detail_response = requests.get(detail_url, params=params)
                    detail_response.raise_for_status()
                    detail_data = detail_response.json()
                    msg = f"Successfully fetched RAWG data for '{query}' (ID: {first_result_id})."
                    if silent:
                        print(msg)
                    else:
                        self.info_message.emit(msg)
                else:
                    msg = f"No game found for query '{query}' on RAWG."
                    if silent:
                        print(msg)
                    else:
                        self.error_occurred.emit(msg)
            except requests.exceptions.HTTPError as e:
                msg = f"Failed to fetch data from RAWG (search) HTTP error ({e.response.status_code}): {e.response.text}"
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except requests.exceptions.RequestException as e:
                msg = f"Failed to fetch data from RAWG (search): {e}"
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)
            except json.JSONDecodeError:
                msg = "Failed to decode JSON response from RAWG (search)."
                if silent:
                    print(msg)
                else:
                    self.error_occurred.emit(msg)

        if detail_data:
            mapped_data = {
                "name": detail_data.get("name", ""),
                "description": self._clean_rawg_description(detail_data.get("description_raw", detail_data.get("description", ""))),
                "release_date": detail_data.get("released", ""),
                "metacritic": detail_data.get("metacritic"),
                "rawg_id": detail_data.get("id"),
                "thumbnail": detail_data.get("background_image_additional", detail_data.get("background_image", "")),
                "background_image": detail_data.get("background_image", ""),
                "genres": [g["name"] for g in detail_data.get("genres", [])],
                "platforms": [
                    {"id": p["platform"]["id"], "name": p["platform"]["name"], 
                     "requirements": p.get("requirements", {"minimum": "N/A", "recommended": "N/A"})}
                    for p in detail_data.get("platforms", [])
                ],
                "screenshots": [s["image"] for s in detail_data.get("short_screenshots", detail_data.get("screenshots", []))]
            }
            return mapped_data
        return None

    def _clean_rawg_description(self, description: str) -> str:
        """Strips HTML tags from RAWG description using BeautifulSoup if available."""
        if BeautifulSoup and description:
            try:
                # Use features='html.parser' for robustness
                return BeautifulSoup(description, "html.parser").get_text(separator='\n').strip()
            except Exception as e:
                self.error_occurred.emit(f"Error cleaning RAWG description with BeautifulSoup: {e}")
                return description
        return description


class GameAdminApp(QWidget):
    """
    Main application window for managing game data.
    Interacts with GameManager for data operations and displays data in a table.
    """
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Admin Hub")
        self.setGeometry(100, 100, 1200, 700)

        self.game_manager = GameManager()
        # Connect GameManager signals to UI update slots
        self.game_manager.games_updated.connect(self._handle_games_updated)
        self.game_manager.error_occurred.connect(self._display_error_message)
        self.game_manager.info_message.connect(self._display_info_message)

        self.all_games = [] # Stores all games from the manager
        self.filtered_games = [] # Stores games currently displayed in the table

        self._init_ui()
        self.game_manager.load_games() # Initial load of data

        self._apply_global_style()

    def _apply_global_style(self) -> None:
        """Applies a consistent modern dark theme to the entire application."""
        self.setStyleSheet("""
            QWidget {
                background-color: #23272e;
                color: #e0e0e0;
                font-family: 'Segoe UI', 'Arial', sans-serif;
                font-size: 10pt;
            }
            QPushButton {
                background-color: #3b4252;
                border: 1px solid #5f5f5f;
                padding: 10px 18px;
                border-radius: 8px;
                color: #e0e0e0;
                font-weight: bold;
                margin: 2px;
            }
            QPushButton:hover {
                background-color: #5e81ac;
                color: #fff;
            }
            QPushButton:pressed {
                background-color: #2e3440;
            }
            QTableWidget QHeaderView::section {
                background-color: #222;
                color: #ffb347;
                font-size: 11pt;
                font-weight: bold;
                border: 1px solid #444;
                padding: 8px;
            }
            QTableWidget {
                selection-background-color: #ffb347;
                selection-color: #23272e;
            }
            QLineEdit, QTextEdit, QSpinBox {
                background-color: #3c3c3c; /* Even darker input fields */
                border: 1px solid #5f5f5f;
                padding: 6px;
                border-radius: 4px;
                color: #e0e0e0;
                selection-background-color: #007acc; /* Blue selection */
            }
            QCheckBox {
                spacing: 6px;
                color: #e0e0e0;
            }
            QCheckBox::indicator {
                width: 16px;
                height: 16px;
                border: 1px solid #6f6f6f;
                border-radius: 4px;
                background-color: #4c4c4c;
            }
            QCheckBox::indicator:checked {
                background-color: #007bff; /* Vibrant blue check */
                border: 1px solid #0056b3;
            }
            QTableWidget {
                background-color: #333333; /* Table background */
                gridline-color: #4a4a4a; /* Grid lines */
                alternate-background-color: #3a3a3a; /* Alternating rows */
                border: 1px solid #4a4a4a;
                border-radius: 5px;
                selection-background-color: #007acc; /* Selected row background */
                selection-color: white;
            }
            QTableWidget::item {
                padding: 5px;
                border: none; /* Items don't have individual borders */
            }
            QTableWidget QHeaderView::section {
                background-color: #4c4c4c; /* Header background */
                color: #e0e0e0;
                padding: 8px;
                border: 1px solid #5f5f5f;
                font-weight: bold;
            }
            QTableWidget QHeaderView::section:hover {
                background-color: #5a5a5a;
            }
            QLabel {
                color: #cccccc;
                font-size: 10pt;
            }
            QDialog {
                background-color: #333333; /* Dialog background */
                color: #e0e0e0;
                border-radius: 8px;
            }
            QDialogButtonBox QPushButton { /* Specific style for dialog buttons */
                background-color: #007bff;
                border: 1px solid #0056b3;
                padding: 8px 15px;
                border-radius: 5px;
                color: white;
            }
            QDialogButtonBox QPushButton:hover {
                background-color: #0060d9;
            }
            QDialogButtonBox QPushButton:pressed {
                background-color: #004da3;
            }
            QTableWidget::item:hover {
                background-color: #44475a;
                color: #ffb347;
            }
        """)

    def _init_ui(self) -> None:
        """Initializes the main UI components."""
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)

        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search games by name or torrent name...")
        self.search_bar.textChanged.connect(self._apply_filters)
        self.layout.addWidget(self.search_bar)

        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["Name", "Original Torrent Name", "Description", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents) # Status column
        self.table.setSortingEnabled(True)
        self.table.setAlternatingRowColors(True) # Better visual distinction
        self.table.cellDoubleClicked.connect(self._view_game_details)
        self.layout.addWidget(self.table)

        button_layout = QHBoxLayout()
        button_layout.setSpacing(10) # Add spacing between buttons

        self.add_button = QPushButton("Add Game")
        self.add_button.clicked.connect(self._add_game)
        self.add_button.setToolTip("Add a new game entry.")
        button_layout.addWidget(self.add_button)

        self.edit_button = QPushButton("Edit Selected Game")
        self.edit_button.clicked.connect(self._edit_selected_game)
        self.edit_button.setToolTip("Edit details of the selected game.")
        button_layout.addWidget(self.edit_button)

        self.delete_button = QPushButton("Delete Selected")
        self.delete_button.clicked.connect(self._delete_selected)
        self.delete_button.setToolTip("Permanently delete selected game(s) from the clone file.")
        button_layout.addWidget(self.delete_button)

        self.hide_button = QPushButton("Hide Selected")
        self.hide_button.clicked.connect(self._hide_selected)
        self.hide_button.setToolTip("Hide selected game(s) from the main view (they remain in the file).")
        button_layout.addWidget(self.hide_button)

        button_layout.addStretch(1) # Pushes the following buttons to the right

        self.export_button = QPushButton("Export Games")
        self.export_button.clicked.connect(self._export_games)
        self.export_button.setToolTip("Export all game data to a new JSON file.")
        button_layout.addWidget(self.export_button)

        self.refresh_button = QPushButton("Refresh")
        self.refresh_button.clicked.connect(self.game_manager.load_games)
        self.refresh_button.setToolTip("Reload game data from the clone file.")
        button_layout.addWidget(self.refresh_button)

        self.reset_button = QPushButton("Reset Clone")
        self.reset_button.clicked.connect(self._reset_clone)
        self.reset_button.setToolTip("Overwrite games_clone.json with games.json. Discards unsaved changes.")
        button_layout.addWidget(self.reset_button)

        self.save_original_button = QPushButton("Save to Original")
        self.save_original_button.clicked.connect(self._save_to_original)
        self.save_original_button.setToolTip("Save current state of the clone file to games.json.")
        button_layout.addWidget(self.save_original_button)

        self.auto_fix_button = QPushButton("Auto-Fix Wrong Games")
        self.auto_fix_button.clicked.connect(self._auto_fix_wrong_games)
        self.auto_fix_button.setToolTip("Try to auto-correct all wrong games using RAWG search.")
        button_layout.addWidget(self.auto_fix_button)

        self.layout.addLayout(button_layout)

        self.stats_label = QLabel("Displaying 0 games")
        self.layout.addWidget(self.stats_label)

    def _handle_games_updated(self, games: list[dict]) -> None:
        """Slot to receive updated game list from GameManager."""
        self.all_games = games
        self._apply_filters()

    def _display_error_message(self, message: str) -> None:
        """Displays an error message to the user."""
        QMessageBox.critical(self, "Error", message)

    def _display_info_message(self, message: str) -> None:
        """Displays an informational message to the user."""
        QMessageBox.information(self, "Info", message)

    def _apply_filters(self) -> None:
        """Applies search and hidden filters and updates the displayed games."""
        search_text = self.search_bar.text().lower().strip()
        
        # Start with all non-hidden games
        visible_games = [game for game in self.all_games if not game.get("hidden", False)]

        if search_text:
            self.filtered_games = [
                game for game in visible_games 
                if search_text in game.get("name", "").lower() 
                or search_text in game.get("original_torrent_name", "").lower()
            ]
        else:
            self.filtered_games = list(visible_games)

        # Always sort the filtered list for consistent display
        self.filtered_games = sorted(self.filtered_games, key=lambda x: x.get("name", "").lower())
        self._display_games_in_table()

    def _display_games_in_table(self) -> None:
        """Populates the QTableWidget with filtered game data."""
        self.table.setRowCount(len(self.filtered_games))
        for row, game in enumerate(self.filtered_games):
            name_item = QTableWidgetItem(game.get("name", "N/A"))
            torrent_item = QTableWidgetItem(game.get("original_torrent_name", "N/A"))
            description_text = game.get("description", "N/A")
            if len(description_text) > 100:
                description_text = description_text[:97] + "..."
            description_item = QTableWidgetItem(description_text)
            status_item = QTableWidgetItem("Correct" if game.get("is_correct") else "Wrong")

            # Add tooltips for full text
            name_item.setToolTip(game.get("name", ""))
            torrent_item.setToolTip(game.get("original_torrent_name", ""))
            description_item.setToolTip(game.get("description", ""))
            status_item.setToolTip("Game data is correct." if game.get("is_correct") else "Game data needs fixing.")

            for item in [name_item, torrent_item, description_item, status_item]:
                item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)

            if not game.get("is_correct"):
                # More visible red, bold, white text
                wrong_game_color = QColor(200, 40, 40)
                for item in [name_item, torrent_item, description_item, status_item]:
                    item.setBackground(wrong_game_color)
                    item.setForeground(QColor("white"))
                    font = item.font()
                    font.setBold(True)
                    item.setFont(font)
            else:
                default_bg_color = QColor("#333333") if row % 2 == 0 else QColor("#3a3a3a")
                for item in [name_item, torrent_item, description_item, status_item]:
                    item.setBackground(default_bg_color)
                    item.setForeground(QColor("#e0e0e0"))

            self.table.setItem(row, 0, name_item)
            self.table.setItem(row, 1, torrent_item)
            self.table.setItem(row, 2, description_item)
            self.table.setItem(row, 3, status_item)

        self.stats_label.setText(f"Displaying {len(self.filtered_games)} games (Total: {len(self.all_games)})")
        self.table.resizeColumnsToContents() # Adjust column widths to fit content

    def _view_game_details(self, row: int, column: int) -> None:
        """Displays a dialog with full details of the selected game."""
        if 0 <= row < len(self.filtered_games):
            game = self.filtered_games[row]
            details = json.dumps(game, indent=4)
            dialog = GameDetailsDialog(self, details)
            dialog.exec()
        else:
            self._display_error_message("Selected row out of bounds. Please refresh.")

    def _add_game(self) -> None:
        """Opens a dialog to add a new game."""
        # For adding, pass a structure that includes all expected keys so the dialog can render them
        # (even if they are empty).
        default_new_game_data = {
            "name": "",
            "original_torrent_name": "",
            "cleaned_search_name": "",
            "magnet": "",
            "size": "",
            "version": "",
            "release_group": "",
            "edition_info": None,
            "languages_info": "",
            "is_native_linux_torrent": False,
            "is_wine_bottled_torrent": False,
            "other_torrent_tags": [],
            "genres": [],
            "platforms": [],
            "platform_type": "",
            "description": "",
            "release_date": "",
            "metacritic": None,
            "rawg_id": None, # Initialize new field
            "thumbnail": "",
            "background_image": "",
            "screenshots": [],
            "hidden": False
        }
        dialog = AddEditGameDialog(self, initial_data=default_new_game_data, game_manager=self.game_manager, is_edit=False)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            new_game_data = dialog.get_game_data()
            self.game_manager.add_game(new_game_data)

    def _edit_selected_game(self) -> None:
        """Opens a dialog to edit the selected game."""
        selected_indexes = self.table.selectedIndexes()
        if not selected_indexes:
            QMessageBox.warning(self, "Warning", "Please select a game to edit.")
            return

        row = selected_indexes[0].row()
        if 0 <= row < len(self.filtered_games):
            game_to_edit = self.filtered_games[row]
            # Pass the original_torrent_name as an identifier to the dialog
            dialog = AddEditGameDialog(self, initial_data=game_to_edit, game_manager=self.game_manager, is_edit=True)
            if dialog.exec() == QDialog.DialogCode.Accepted:
                updated_game_data = dialog.get_game_data()
                # Pass the original torrent name for identification, and the updated data
                # This ensures we update the correct entry even if the name changes
                self.game_manager.update_game(game_to_edit["original_torrent_name"], updated_game_data)
        else:
            self._display_error_message("Selected row out of bounds. Please refresh.")

    def _delete_selected(self) -> None:
        """Deletes selected game(s) after confirmation."""
        selected_rows = sorted(set(index.row() for index in self.table.selectedIndexes()))
        if not selected_rows:
            QMessageBox.warning(self, "Warning", "No game selected.")
            return

        confirm = QMessageBox.question(self, "Confirm Deletion", 
                                       f"Are you sure you want to delete {len(selected_rows)} game(s)? "
                                       "This action cannot be undone unless you reset the clone.",
                                       QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if confirm == QMessageBox.StandardButton.Yes:
            games_to_delete = [self.filtered_games[row] for row in selected_rows if 0 <= row < len(self.filtered_games)]
            self.game_manager.delete_games(games_to_delete)

    def _hide_selected(self) -> None:
        """Hides selected game(s) after confirmation."""
        selected_rows = sorted(set(index.row() for index in self.table.selectedIndexes()))
        if not selected_rows:
            QMessageBox.warning(self, "Warning", "No game selected.")
            return
        
        confirm = QMessageBox.question(self, "Confirm Hide", 
                                       f"Are you sure you want to hide {len(selected_rows)} game(s)? "
                                       "They will no longer appear in the list unless you view the raw JSON.",
                                       QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if confirm == QMessageBox.StandardButton.Yes:
            games_to_hide = [self.filtered_games[row] for row in selected_rows if 0 <= row < len(self.filtered_games)]
            self.game_manager.hide_games(games_to_hide)

    def _export_games(self) -> None:
        """Exports all game data to a chosen JSON file."""
        path, _ = QFileDialog.getSaveFileName(self, "Export Games", "games_export.json", "JSON Files (*.json)")
        if not path:
            return
        try:
            # Get the complete list of games from the manager for export
            with open(path, "w") as f:
                json.dump(self.game_manager.get_all_games(), f, indent=4)
            self._display_info_message(f"Games exported to {path}")
        except Exception as e:
            self._display_error_message(f"Failed to export: {e}")

    def _reset_clone(self) -> None:
        """Resets the clone file to the original games.json state."""
        confirm = QMessageBox.question(self, "Confirm Reset Clone", 
                                       "Reset clone to original file? All unsaved changes in the clone will be lost.",
                                       QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if confirm == QMessageBox.StandardButton.Yes:
            self.game_manager.reset_clone()

    def _save_to_original(self) -> None:
        """Saves current clone data to the original games.json file."""
        confirm = QMessageBox.question(self, "Confirm Save to Original", 
                                       "Are you sure you want to save current changes to the original games.json file? This will overwrite it.",
                                       QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if confirm == QMessageBox.StandardButton.Yes:
            self.game_manager.save_to_original()

    def _auto_fix_wrong_games(self) -> None:
        """Auto-fix all wrong games by searching RAWG with the first part of the torrent name."""
        wrong_games = [g for g in self.all_games if not g.get("is_correct")]
        if not wrong_games:
            print("No wrong games to auto-fix.")
            return

        updated_count = 0
        print(f"Auto-fix started: {len(wrong_games)} wrong games found.")
        for idx, game in enumerate(wrong_games, 1):
            torrent_name = game.get("original_torrent_name", "")
            print(f"[{idx}/{len(wrong_games)}] Processing: {torrent_name}")
            if not torrent_name:
                print("  Skipped: No torrent name.")
                continue
            search_name = torrent_name.split('-')[0].strip()
            if not search_name:
                print("  Skipped: No search name extracted.")
                continue
            rawg_data = self.game_manager.fetch_game_data_from_rawg(search_name, silent=True)
            if rawg_data:
                updated_game = {**game, **rawg_data}
                self.game_manager.update_game(game["original_torrent_name"], updated_game, silent=True)  # <--- silent=True here!
                print("  Updated from RAWG.")
                updated_count += 1
            else:
                print("  RAWG fetch failed or not found.")

        print(f"Auto-fix complete. Updated {updated_count} game(s).")


class GameDetailsDialog(QDialog):
    """A dialog to display the full JSON details of a game."""
    def __init__(self, parent: QWidget, details: str):
        super().__init__(parent)
        self.setWindowTitle("Game Details")
        self.setGeometry(150, 150, 600, 400)

        layout = QVBoxLayout()
        self.setLayout(layout)

        details_text = QTextEdit()
        details_text.setReadOnly(True)
        details_text.setText(details)
        details_text.setFont(QFont("Monospace", 9)) # Monospace for JSON clarity
        layout.addWidget(details_text)

        # Apply dialog-specific styling (inherited from app's global style but can be overridden)
        self.setStyleSheet("""
            QDialog {
                background-color: #3e3e3e;
                color: #e0e0e0;
                border-radius: 8px;
            }
            QTextEdit {
                background-color: #2b2b2b;
                border: 1px solid #4a4a4a;
                color: #e0e0e0;
                padding: 10px;
                border-radius: 5px;
            }
        """)


class AddEditGameDialog(QDialog):
    """A dialog for adding or editing game entries, with dynamic field rendering and RAWG fetch integration."""
    def __init__(self, parent: QWidget, initial_data: dict, game_manager: GameManager = None, is_edit: bool = False):
        super().__init__(parent)
        self.game_manager = game_manager
        self.is_edit = is_edit
        self.initial_data = initial_data
        self.input_widgets = {} # Store references to dynamically created input widgets
        
        if self.is_edit:
            self.setWindowTitle(f"Edit Game: {self.initial_data.get('name', 'Unknown')}")
        else:
            self.setWindowTitle("Add New Game")
        self.setGeometry(200, 200, 700, 800) # Make it larger to accommodate more fields

        self._init_ui()
        self._apply_dialog_style()

    def _apply_dialog_style(self) -> None:
        """Applies specific styling for the add/edit dialog."""
        self.setStyleSheet("""
            QDialog {
                background-color: #333333;
                color: #e0e0e0;
                border-radius: 8px;
            }
            QLabel {
                color: #cccccc;
                font-weight: bold;
                padding-top: 5px; /* Spacing for labels */
            }
            QLineEdit, QTextEdit, QSpinBox {
                background-color: #3c3c3c;
                border: 1px solid #5f5f5f;
                padding: 6px;
                border-radius: 4px;
                color: #e0e0e0;
                selection-background-color: #007acc;
            }
            QTextEdit {
                min-height: 50px; /* Default min height for text areas */
            }
            QCheckBox {
                spacing: 6px;
                color: #e0e0e0;
            }
            QCheckBox::indicator {
                width: 16px;
                height: 16px;
                border: 1px solid #6f6f6f;
                border-radius: 4px;
                background-color: #4c4c4c;
            }
            QCheckBox::indicator:checked {
                background-color: #007bff;
                border: 1px solid #0056b3;
            }
            QPushButton {
                background-color: #4a4a4a;
                border: 1px solid #5f5f5f;
                padding: 8px 15px;
                border-radius: 5px;
                color: #e0e0e0;
            }
            QPushButton:hover {
                background-color: #5a5a5a;
            }
            QPushButton:pressed {
                background-color: #3a3a3a;
            }
            QDialogButtonBox QPushButton {
                background-color: #007bff;
                border: 1px solid #0056b3;
                color: white;
            }
            QDialogButtonBox QPushButton:hover {
                background-color: #0060d9;
            }
            QDialogButtonBox QPushButton:pressed {
                background-color: #004da3;
            }
            /* Styling for QScrollArea and its content */
            QScrollArea {
                border: none; /* Remove border from scroll area itself */
            }
            QScrollArea > QWidget > QWidget { /* The actual content widget inside scroll area */
                background-color: #333333; /* Match dialog background */
            }
            QScrollBar:vertical {
                border: 1px solid #4a4a4a;
                background: #333333;
                width: 12px;
                margin: 0px 0px 0px 0px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical {
                background: #5f5f5f;
                min-height: 20px;
                border-radius: 5px;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                border: none;
                background: none;
            }
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {
                background: none;
            }
        """)

    def _init_ui(self) -> None:
        """Initializes the UI components of the add/edit dialog dynamically."""
        main_layout = QVBoxLayout()
        self.setLayout(main_layout)

        # Create a QScrollArea
        scroll_area = QScrollArea(self)
        scroll_area.setWidgetResizable(True) # Make the widget inside resizable

        # Create a QWidget to hold the QFormLayout, and set it as the scroll area's widget
        scroll_content_widget = QWidget()
        form_layout = QFormLayout(scroll_content_widget)
        scroll_area.setWidget(scroll_content_widget)
        
        main_layout.addWidget(scroll_area) # Add the scroll area to the main dialog layout

        # Define an order for common fields, then add others alphabetically
        field_order = [
            "name", "original_torrent_name", "cleaned_search_name",
            "description", # Place description higher for readability
            "magnet", "size", "version", "release_group",
            "edition_info", "languages_info",
            "is_native_linux_torrent", "is_wine_bottled_torrent", "platform_type",
            "rawg_id", "release_date", "metacritic",
            "thumbnail", "background_image", "screenshots", # Images/media
            "genres", "platforms", "other_torrent_tags", # Complex lists
            "hidden" # Always last for visibility
        ]

        # Use a set to track fields already added to avoid duplicates
        added_fields = set()

        for field_name in field_order:
            if field_name in self.initial_data:
                self._add_field_to_layout(form_layout, field_name, self.initial_data[field_name])
                added_fields.add(field_name)

        # Add any other fields not in the predefined order, alphabetically
        for field_name in sorted(self.initial_data.keys()):
            # Exclude derived fields or internal ones
            if field_name not in added_fields and field_name not in ["is_correct"]: 
                self._add_field_to_layout(form_layout, field_name, self.initial_data[field_name])

        self.fetch_rawg_button_in_dialog = QPushButton("Fetch from RAWG (Overrides Name/Desc/Metadata)")
        self.fetch_rawg_button_in_dialog.clicked.connect(self._fetch_from_rawg_in_dialog)
        self.fetch_rawg_button_in_dialog.setToolTip("Fetch game details from RAWG based on a query or existing RAWG ID. Overwrites Name, Description, Genres, Platforms, Release Date, Metacritic, Images, and RAWG ID.")
        form_layout.addRow(self.fetch_rawg_button_in_dialog)

        button_box = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        button_box.accepted.connect(self.accept_dialog) # Connect to custom accept method
        button_box.rejected.connect(self.reject)
        main_layout.addWidget(button_box) # Add button box to main layout, not form layout

    def _add_field_to_layout(self, layout: QFormLayout, field_name: str, field_value: any) -> None:
        """Dynamically adds an input widget based on field type."""
        label_text = field_name.replace('_', ' ').title() + ":"
        widget = None

        if isinstance(field_value, bool):
            widget = QCheckBox()
            widget.setChecked(field_value)
        elif field_name == "metacritic": # Explicitly handle metacritic as SpinBox for ints
            widget = QSpinBox()
            widget.setRange(0, 100)
            if field_value is not None:
                widget.setValue(field_value)
            else:
                widget.setSpecialValueText("N/A") # Show N/A when value is 0
        elif field_name == "rawg_id": # RAWG ID as a regular integer or None
            widget = QSpinBox()
            widget.setRange(0, 999999999) # Large range for IDs
            widget.setSpecialValueText("None") # For null ID
            if field_value is not None:
                widget.setValue(int(field_value))
            else:
                widget.setValue(0) # Default to 0, interpreted as None by special text
        elif field_name == "release_date" : # Use QLineEdit for date string
            widget = QLineEdit(str(field_value) if field_value is not None else "")
            widget.setPlaceholderText("YYYY-MM-DD (e.g., 2023-01-15)")
        elif isinstance(field_value, (list, dict)) or field_name in ["magnet", "description", "screenshots", "other_torrent_tags"]:
            # Force certain fields to QTextEdit for multiline or JSON input
            widget = QTextEdit()
            try:
                if field_value is not None:
                    # For lists/dicts, try to dump as JSON for easier editing
                    widget.setText(json.dumps(field_value, indent=2))
                else:
                    widget.setText("")
            except TypeError: # Fallback if value is not JSON serializable (e.g., non-string in a list)
                widget.setText(str(field_value) if field_value is not None else "")
            widget.setMinimumHeight(80 if field_name == "description" else 50)
            if field_name == "screenshots":
                widget.setPlaceholderText("Enter a JSON array of image URLs, e.g.,\n[\n  \"http://example.com/img1.jpg\",\n  \"http://example.com/img2.jpg\"\n]")
            elif field_name == "genres":
                widget.setPlaceholderText("Enter a JSON array of strings, e.g.,\n[\"Action\", \"RPG\"]")
            elif field_name == "platforms":
                widget.setPlaceholderText("Enter a JSON array of objects, e.g.,\n[\n  {\"id\": 4, \"name\": \"PC\", \"requirements\": {...}}\n]")
            elif field_name == "other_torrent_tags":
                widget.setPlaceholderText("Comma-separated tags, e.g., tag1, tag2")
        else: # Default to QLineEdit for strings and other simple types
            widget = QLineEdit()
            widget.setText(str(field_value) if field_value is not None else "")
            
        if widget:
            layout.addRow(label_text, widget)
            self.input_widgets[field_name] = widget

    def get_game_data(self) -> dict:
        """
        Gathers all data from the dynamically created input widgets.
        Handles type conversion based on expected field types.
        """
        updated_data = {}
        for field_name, widget in self.input_widgets.items():
            value = None
            if isinstance(widget, QLineEdit):
                value = widget.text().strip()
                # If a field *should* be numeric but is a QLineEdit (e.g., if type inference was off)
                if field_name == "rawg_id": # Fallback if for some reason it's a QLineEdit
                    try:
                        value = int(value) if value else None
                    except ValueError:
                        value = None # Invalid int input
            elif isinstance(widget, QTextEdit):
                text_value = widget.toPlainText().strip()
                if field_name in ["genres", "platforms", "screenshots"]:
                    try:
                        value = json.loads(text_value)
                        # Basic validation for lists
                        if not isinstance(value, list):
                            raise ValueError("Expected a JSON array.")
                    except json.JSONDecodeError:
                        self.game_manager.info_message.emit(f"Warning: Could not parse JSON for '{field_name}'. Using raw text or empty list. Input: '{text_value}'")
                        value = [] # Fallback to empty list on JSON error for structured lists
                    except ValueError as e:
                        self.game_manager.info_message.emit(f"Warning: Data format error for '{field_name}': {e}. Using empty list. Input: '{text_value}'")
                        value = [] # Fallback for incorrect JSON array type
                elif field_name == "other_torrent_tags": # Comma-separated list for this specific field
                    value = [tag.strip() for tag in text_value.split(',') if tag.strip()]
                else: # For description, magnet etc.
                    value = text_value
            elif isinstance(widget, QCheckBox):
                value = widget.isChecked()
            elif isinstance(widget, QSpinBox):
                value = widget.value()
                if field_name == "metacritic" and value == 0 and widget.specialValueText() == "N/A":
                    value = None # Interpret 0 as None if 'N/A' is special text for metacritic
                elif field_name == "rawg_id" and value == 0 and widget.specialValueText() == "None":
                    value = None # Interpret 0 as None if 'None' is special text for rawg_id

            updated_data[field_name] = value

        # Ensure that fields that might not have been in initial_data (e.g. for a new game)
        # or were not modified are present with default/initial values to avoid data loss.
        # This is especially crucial for fields that are not typically edited via RAWG fetch
        # or that might be missing from an older `games.json` entry.
        # We merge with initial_data to preserve any fields not in the dialog,
        # then apply updated_data to override.
        final_data = {**self.initial_data, **updated_data}
        if "is_correct" in final_data: # is_correct is always computed, remove if it somehow got in
            del final_data["is_correct"]

        # Post-processing to ensure lists are lists and None for missing fields
        for field in ["genres", "platforms", "screenshots", "other_torrent_tags"]:
            if field not in final_data or final_data[field] is None:
                final_data[field] = []
            elif not isinstance(final_data[field], list):
                # Attempt to convert to list if it's a string that might be a simple comma/newline separated list
                if isinstance(final_data[field], str):
                    # For screenshots, genres, platforms, assume JSON array.
                    # For other_torrent_tags, assume comma-separated.
                    if field in ["screenshots", "genres", "platforms"]:
                         try:
                             parsed_list = json.loads(final_data[field])
                             if isinstance(parsed_list, list):
                                 final_data[field] = parsed_list
                             else:
                                 raise ValueError("Parsed JSON is not a list.")
                         except (json.JSONDecodeError, ValueError):
                             self.game_manager.info_message.emit(f"Warning: '{field}' field expects JSON array, but received unparsable string. Setting to empty list.")
                             final_data[field] = []
                    elif field == "other_torrent_tags":
                        final_data[field] = [item.strip() for item in final_data[field].split(',') if item.strip()]
                    else: # Fallback for other non-list types
                        final_data[field] = []

                else: # Fallback for other non-list types
                    final_data[field] = []

        # Ensure numeric fields that should be None if empty string/0
        for field in ["metacritic", "rawg_id"]:
            if final_data.get(field) == 0: # If spinbox default is 0 and it means None
                final_data[field] = None
            elif isinstance(final_data.get(field), str) and not final_data.get(field): # If QLineEdit was empty
                final_data[field] = None

        return final_data

    def accept_dialog(self) -> None:
        """Custom accept method to perform validation before closing."""
        game_data = self.get_game_data()
        if not self.game_manager._validate_game_data(game_data): # Use manager's validation
            QMessageBox.warning(self, "Input Error", "Essential fields (Game Name, Original Torrent Name, Description) cannot be empty.")
            return
        super().accept() # Call the QDialog's accept method if validation passes

    def _fetch_from_rawg_in_dialog(self) -> None:
        """Prompts for a RAWG query and populates fields if data is found."""
        current_rawg_id = self.initial_data.get("rawg_id") # Get existing RAWG ID
        
        # Construct a more informative prompt based on whether a RAWG ID exists
        if current_rawg_id and current_rawg_id > 0:
            prompt_text = (
                f"Enter **Game Name** or a **Game ID** to search RAWG.\n"
                f"Leave empty to refetch using the existing ID: **{current_rawg_id}**"
            )
            initial_input = "" # Start with empty, so user can easily choose to use existing ID
        else:
            prompt_text = "Enter **Game Name** or a **Game ID** to search RAWG:"
            initial_input = self.input_widgets.get("name", QLineEdit()).text().strip() # Suggest current game name

        game_query, ok = QInputDialog.getText(
            self,
            "Fetch from RAWG",
            prompt_text,
            QLineEdit.EchoMode.Normal,
            initial_input
        )
            
        if not ok:
            return # User cancelled

        # Determine which query to use for RAWG API
        effective_query = game_query.strip() if game_query else None # If user typed something, use it
        
        # Call fetch_game_data_from_rawg, passing both query and current_rawg_id for intelligent fetching
        rawg_data = self.game_manager.fetch_game_data_from_rawg(effective_query, current_rawg_id)

        if rawg_data:
            # Update corresponding widgets with RAWG data
            for field_name, value in rawg_data.items():
                if field_name in self.input_widgets:
                    widget = self.input_widgets[field_name]
                    if isinstance(widget, QLineEdit):
                        widget.setText(str(value) if value is not None else "")
                    elif isinstance(widget, QTextEdit):
                        if isinstance(value, (list, dict)):
                            try:
                                widget.setText(json.dumps(value, indent=2))
                            except TypeError:
                                widget.setText(str(value) if value is not None else "")
                        else:
                            widget.setText(str(value) if value is not None else "")
                    elif isinstance(widget, QCheckBox):
                        widget.setChecked(bool(value))
                    elif isinstance(widget, QSpinBox):
                        if value is not None and value > 0: # Ensure positive ID
                            widget.setValue(int(value))
                        else:
                            # Set to special value text equivalent of None (e.g. 0 for metacritic/rawg_id)
                            widget.setValue(0) # Will be interpreted as None by get_game_data
            
            # Also update initial_data for next fetch if rawg_id changed (useful for subsequent fetches within same edit session)
            self.initial_data.update(rawg_data)

            QMessageBox.information(self, "RAWG Data Loaded", "Game details (Name, Description, Genres, Platforms, Release Date, Metacritic, Images, RAWG ID) loaded from RAWG. Please review and provide/confirm torrent-specific details.")
        else:
            QMessageBox.warning(self, "RAWG Fetch Failed", f"Could not find game '{game_query}' on RAWG or an error occurred. Check console for details.")
            
            
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = GameAdminApp()
    window.show()
    sys.exit(app.exec())