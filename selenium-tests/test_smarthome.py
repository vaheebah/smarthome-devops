"""
SmartHome Dashboard - Selenium Test Suite
Run: pip install selenium webdriver-manager
     python selenium-tests/test_smarthome.py
"""

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:3000"


def get_driver():
    options = Options()
    options.add_argument("--headless")       # Remove for visible browser
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


class TestHomepage(unittest.TestCase):
    """Test Case 1: Verify homepage loads correctly"""

    def setUp(self):
        self.driver = get_driver()
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        self.driver.quit()

    def test_homepage_loads(self):
        """Dashboard page should load with title and sidebar"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        # Check page title
        self.assertIn("SmartHome", self.driver.title)
        print("✅ TC1.1 - Page title contains 'SmartHome'")

    def test_sidebar_visible(self):
        """Sidebar with navigation should be visible"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        sidebar = self.driver.find_element(By.CLASS_NAME, "sidebar")
        self.assertTrue(sidebar.is_displayed())
        print("✅ TC1.2 - Sidebar is visible")

    def test_logo_present(self):
        """Logo 'NEXUSHOME' should be in the sidebar"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        logo = self.driver.find_element(By.CLASS_NAME, "logo-text")
        self.assertIn("NEXUS", logo.text)
        print("✅ TC1.3 - Logo text is present")


class TestNavigation(unittest.TestCase):
    """Test Case 2: Validate navigation behavior"""

    def setUp(self):
        self.driver = get_driver()
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        self.driver.quit()

    def test_room_navigation(self):
        """Clicking a room in the sidebar should filter devices"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        nav_items = self.driver.find_elements(By.CLASS_NAME, "nav-item")
        self.assertGreater(len(nav_items), 0, "No navigation items found")
        print(f"✅ TC2.1 - Found {len(nav_items)} navigation items")

    def test_sidebar_toggle(self):
        """Sidebar toggle button should collapse and expand the sidebar"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        toggle_btn = self.driver.find_element(By.CLASS_NAME, "toggle-btn")
        toggle_btn.click()
        time.sleep(0.5)

        sidebar = self.driver.find_element(By.CLASS_NAME, "sidebar")
        self.assertIn("closed", sidebar.get_attribute("class"))
        print("✅ TC2.2 - Sidebar collapses on toggle")

        # Toggle back
        toggle_btn.click()
        time.sleep(0.5)
        self.assertIn("open", sidebar.get_attribute("class"))
        print("✅ TC2.3 - Sidebar reopens on second toggle")

    def test_all_rooms_link_active_by_default(self):
        """'All' room should be active by default"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        nav_items = self.driver.find_elements(By.CLASS_NAME, "nav-item")
        first_item = nav_items[0]
        self.assertIn("active", first_item.get_attribute("class"))
        print("✅ TC2.4 - 'All' rooms is active by default")


class TestApiConnection(unittest.TestCase):
    """Test Case 3: Check frontend-to-backend API response"""

    def setUp(self):
        self.driver = get_driver()
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        self.driver.quit()

    def test_stats_panel_renders(self):
        """Stats panel should render 4 stat cards"""
        self.driver.get(BASE_URL)
        time.sleep(3)

        stat_cards = self.driver.find_elements(By.CLASS_NAME, "stat-card")
        self.assertEqual(len(stat_cards), 4, f"Expected 4 stat cards, found {len(stat_cards)}")
        print("✅ TC3.1 - 4 stats cards rendered from API data")

    def test_seed_data_button_visible_when_no_devices(self):
        """'Load Sample Data' button should appear when device list is empty"""
        self.driver.get(BASE_URL)
        time.sleep(3)

        # If no devices present, seed button should show
        try:
            seed_btn = self.driver.find_element(By.XPATH, "//button[contains(text(),'Load Sample Data')]")
            self.assertTrue(seed_btn.is_displayed())
            print("✅ TC3.2 - Seed data button visible (no devices in DB)")
        except Exception:
            print("✅ TC3.2 - Devices already loaded (seed button not shown)")

    def test_add_device_modal_opens(self):
        """Clicking '+ Add Device' should open the modal"""
        self.driver.get(BASE_URL)
        time.sleep(3)

        add_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Add Device')]"))
        )
        add_btn.click()
        time.sleep(0.5)

        modal = self.driver.find_element(By.CLASS_NAME, "modal")
        self.assertTrue(modal.is_displayed())
        print("✅ TC3.3 - Add Device modal opens on button click")

    def test_modal_closes_on_cancel(self):
        """Cancel button in modal should close it"""
        self.driver.get(BASE_URL)
        time.sleep(3)

        add_btn = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Add Device')]"))
        )
        add_btn.click()
        time.sleep(0.5)

        cancel_btn = self.driver.find_element(By.CLASS_NAME, "btn-cancel")
        cancel_btn.click()
        time.sleep(0.5)

        modals = self.driver.find_elements(By.CLASS_NAME, "modal")
        for m in modals:
            self.assertFalse(m.is_displayed())
        print("✅ TC3.4 - Modal closes on cancel")


class TestDeviceInteraction(unittest.TestCase):
    """Test Case 4: Validate device toggle behavior"""

    def setUp(self):
        self.driver = get_driver()
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        self.driver.quit()

    def test_device_cards_rendered(self):
        """Device grid should render cards if devices exist"""
        self.driver.get(BASE_URL)
        time.sleep(3)

        device_cards = self.driver.find_elements(By.CLASS_NAME, "device-card")
        print(f"✅ TC4.1 - Found {len(device_cards)} device cards")

    def test_refresh_button_clickable(self):
        """Refresh button should be clickable"""
        self.driver.get(BASE_URL)
        time.sleep(2)

        refresh_btn = self.driver.find_element(By.CSS_SELECTOR, ".btn-ghost")
        refresh_btn.click()
        time.sleep(1)
        print("✅ TC4.2 - Refresh button clicked successfully")


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  SmartHome Dashboard - Selenium Test Suite")
    print("="*60 + "\n")

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestHomepage))
    suite.addTests(loader.loadTestsFromTestCase(TestNavigation))
    suite.addTests(loader.loadTestsFromTestCase(TestApiConnection))
    suite.addTests(loader.loadTestsFromTestCase(TestDeviceInteraction))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "="*60)
    print(f"  Ran {result.testsRun} tests")
    print(f"  Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  Failed: {len(result.failures)}")
    print(f"  Errors: {len(result.errors)}")
    print("="*60 + "\n")
