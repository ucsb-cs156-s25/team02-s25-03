package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import java.nio.file.Paths;
import java.util.List;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Locator;


import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {
        setupUser(true);

        page.getByText("UCSB Organizations").click();

        page.getByText("Create Organization").click();
        assertThat(page.getByText("Create New Organization")).isVisible();
        page.getByTestId("OrganizationForm-orgCode").fill("IEEE");
        page.getByTestId("OrganizationForm-orgTranslationShort").fill("Engineering");
        page.getByTestId("OrganizationForm-orgTranslation").fill("Institute of Electrical and Electronics Engineers");
        page.getByTestId("OrganizationForm-inactive").selectOption("false");
        page.getByTestId("OrganizationForm-submit").click();

        page.waitForSelector("[data-testid='OrganizationTable-cell-row-0-col-orgTranslation']");
        assertThat(page.getByTestId("OrganizationTable-cell-row-0-col-orgTranslation")).hasText("Institute of Electrical and Electronics Engineers");

        page.getByTestId("OrganizationTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit Organization")).isVisible();
        page.getByTestId("OrganizationForm-orgTranslationShort").fill("Engineering Society");
        page.getByTestId("OrganizationForm-submit").click();
        
        page.waitForResponse(
            resp -> resp.url().contains("/api/ucsborganization") && resp.status() == 200,
            () -> {
                page.getByTestId("OrganizationForm-submit").click();
            }
        );

        
        page.waitForSelector("[data-testid='OrganizationTable-cell-row-0-col-orgTranslationShort']");
        assertThat(page.getByTestId("OrganizationTable-cell-row-0-col-orgTranslationShort")).hasText("Engineering Society");

        page.getByTestId("OrganizationTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("OrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_ucsborganization() throws Exception {
        setupUser(false);

        page.getByText("UCSB Organization").click();

        assertThat(page.getByText("Create Organization")).not().isVisible();
        assertThat(page.getByTestId("OrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
    }
}