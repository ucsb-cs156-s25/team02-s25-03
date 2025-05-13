package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_restaurant() throws Exception {
        setupUser(true);

        page.getByText("UCSB Dining Commons Menu Items").click();

        page.getByText("Create UCSB Dining Commons Menu Item").click();
        assertThat(page.getByText("Create New UCSB Dining Commons Menu Item")).isVisible();
        page.getByLabel("Dining Commons Code").fill("ortega");
        page.getByLabel("Name").fill("banana");
        page.getByLabel("Station").fill("fruits");

        // page.getByText("Create").click();
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Create")).click();

        assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode")).hasText("ortega");

        page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit UCSB Dining Commons Menu Item")).isVisible();
        page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("portola");
        page.getByText("Update").click();

        assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode")).hasText("portola");

        page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_UCSBDiningCommonsMenuItem() throws Exception {
        setupUser(false);

        page.getByText("UCSB Dining Commons Menu Items").click();

        assertThat(page.getByText("Create UCSB Dining Commons Menu Item")).not().isVisible();
    }
}