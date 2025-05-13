package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

import java.time.LocalDateTime;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {

    @Autowired
    ArticlesRepository articlesRepository;
    
    @Test
    public void admin_user_can_create_edit_delete_article() throws Exception {
        LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

        String title = "Deploying a Dokku App";

        Article article = Article.builder()
                .title(title)
                .url("https://ucsb-cs156.github.io/topics/dokku/deploying_simple_app.html")
                .explanation("Step-by-step on how to deploy a Dokku app")
                .email("karena_lai@ucsb.edu")
                .dateAdded(ldt)
                .build();

        articlesRepository.save(article);

        setupUser(true);

        page.getByText("Articles").click();

        // page.getByText("Create Article").click();
        // assertThat(page.getByText("Create New Article")).isVisible();
        // page.getByLabel("Title").fill("Your Mom's Article");
        // page.getByLabel("Url").fill("urmomwebsite.com");
        // page.getByLabel("Explanation").fill("Your mom wrote an article and you should read it.");
        // page.getByLabel("Email").fill("urmomemail@email");
        // page.getByLabel("Date Added (iso format)").fill("2024-04-04T04:04:04");
        // page.getByText("Create").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title"))
                .hasText(title);

        page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();
        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title"))
                .not().isVisible();

        // assertThat(page.getByText("Edit Article")).isVisible();
        // page.getByTestId("ArticlesForm-description").fill("THE BEST");
        // page.getByTestId("ArticlesForm-submit").click();

        // assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-description")).hasText("THE BEST");

        // page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

        // assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-name")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_article() throws Exception {
        setupUser(false);

        page.getByText("Articles").click();

        assertThat(page.getByText("Create Article")).not().isVisible();
    }

    @Test
    public void admin_user_can_see_create_article_button() throws Exception {
        setupUser(true);

        page.getByText("Articles").click();

        assertThat(page.getByText("Create Article")).isVisible();
    }
}