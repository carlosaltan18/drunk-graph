package com.uvg.drunkgraph;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Node<T> {

    private T data;
    private Node<T> next;

    public Node(T data) {
        this.data = data;
        this.next = null;
    }
}
