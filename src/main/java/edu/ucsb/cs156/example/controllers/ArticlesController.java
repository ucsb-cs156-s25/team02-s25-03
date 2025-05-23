package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.entities.UCSBDate;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

/**
 * This is a REST controller for UCSBDates
 */

 @Tag(name = "Articles")
 @RequestMapping("/api/articles")
 @RestController
 @Slf4j
 
 public class ArticlesController extends ApiController {
    @Autowired
    ArticlesRepository articlesRepository;


    /**
     * List all Articles
     * 
     * @return an iterable of Article 
     */
    @Operation(summary= "List all articles")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Article> allArticles() {
        Iterable<Article> articles= articlesRepository.findAll();
        return articles;
    }

 /**
     * Get a single article by id
     * 
     * @param id the id of the article
     * @return a Article
     */
    @Operation(summary= "Get a single article by id")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public Article getById(
            @Parameter(name="id") @RequestParam Long id) {
        Article article = articlesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

        return article;
    }

    /**
     * Create a new Article 
     * 
     * @param title the article's title
     * @param url the article's url
     * @param explanation the article's explanation
     * @param email the author's email
     * @param dateAdded date article was added, no timezone information
     * @return the saved Article
     */
    @Operation(summary= "Create a new article")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Article postArticle(
            @Parameter(name="title") @RequestParam String title,
            @Parameter(name="url") @RequestParam String url,
            @Parameter(name="explanation") @RequestParam String explanation,
            @Parameter(name="email") @RequestParam String email,
            @Parameter(name="dateAdded", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS)") @RequestParam("dateAdded") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateAdded)
            throws JsonProcessingException {

        // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        // See: https://www.baeldung.com/spring-date-parameters

        log.info("dateAdded={}", dateAdded);

        Article article= new Article();
        article.setTitle(title);
        article.setUrl(url);
        article.setExplanation(explanation);
        article.setEmail(email);
        article.setDateAdded(dateAdded);

        Article savedArticle = articlesRepository.save(article);

        return savedArticle;
    }

   /**
     * Update a single Article
     * 
     * @param id       id of the Article to update
     * @param incoming the new Article
     * @return the updated Article object
     */
    @Operation(summary= "Update a single article")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public Article updateArticle(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid Article incoming) {

        Article article = articlesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

        article.setTitle(incoming.getTitle());
        article.setUrl(incoming.getUrl());
        article.setExplanation(incoming.getExplanation());
        article.setEmail(incoming.getEmail());
        article.setDateAdded(incoming.getDateAdded());

        articlesRepository.save(article);

        return article;
    }

    /**
     * Delete an Article
     * 
     * @param id the id of the Article to delete
     * @return a message indicating the Article was deleted
     */
    @Operation(summary= "Delete an Article")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteArticle(
            @Parameter(name="id") @RequestParam Long id) {
        Article article = articlesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Article.class, id));

        articlesRepository.delete(article);
        return genericMessage("Article with id %s deleted".formatted(id));
    }    
 }